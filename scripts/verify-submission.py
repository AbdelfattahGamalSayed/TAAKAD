"""Check the rubric artifacts with Python's standard library only.

Visual review of rendered Word pages and PowerPoint slides is still required.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as E

ROOT=Path(__file__).resolve().parents[1]
NS={"a":"http://schemas.openxmlformats.org/drawingml/2006/main","p":"http://schemas.openxmlformats.org/presentationml/2006/main","w":"http://schemas.openxmlformats.org/wordprocessingml/2006/main","r":"http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
data=json.loads((ROOT/'submission/source/content.json').read_text(encoding='utf-8'))

def normalize(path,title):
    cp='http://schemas.openxmlformats.org/package/2006/metadata/core-properties'
    dc='http://purl.org/dc/elements/1.1/'
    E.register_namespace('cp',cp);E.register_namespace('dc',dc)
    E.register_namespace('dcterms','http://purl.org/dc/terms/')
    E.register_namespace('xsi','http://www.w3.org/2001/XMLSchema-instance')
    with ZipFile(path) as z:
        entries=[(info,z.read(info.filename)) for info in z.infolist()]
    fixed=[]
    for info,content in entries:
        if info.filename=='docProps/core.xml':
            root=E.fromstring(content)
            for namespace,key,value in [(dc,'creator','; '.join(data['team'])),(dc,'title',title),(dc,'subject','TAAKAD MVP and judging rubric evidence'),(cp,'lastModifiedBy','TAAKAD team')]:
                node=root.find('{'+namespace+'}'+key)
                if node is None:node=E.SubElement(root,'{'+namespace+'}'+key)
                node.text=value
            content=E.tostring(root,encoding='utf-8',xml_declaration=True)
        fixed.append((info,content))
    tmp=path.with_suffix(path.suffix+'.normalized')
    with ZipFile(tmp,'w') as z:
        for info,content in fixed:z.writestr(info,content)
    tmp.replace(path)

def inspect(path):
    assert path.stat().st_size<20*1024*1024, 'Upload exceeds 20 MB'
    with ZipFile(path) as z:
        assert z.testzip() is None
        assert not any('vbaProject' in n for n in z.namelist())
        for name in z.namelist():
            if name.endswith('.rels'):
                for relationship in E.fromstring(z.read(name)):
                    if relationship.get('TargetMode')=='External':
                        assert relationship.get('Target','').startswith('https://'), 'Unexpected local/external reference'
        core=E.fromstring(z.read('docProps/core.xml'))
        assert all(person in ''.join(core.itertext()) for person in data['team'])
        if path.suffix=='.pptx':
            names=sorted((n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)),key=lambda n:int(re.search(r'(\d+)\.xml',n).group(1)))
            assert len(names)==len(data['slides'])
            paired=[];native_tables=0;all_text=[]
            for index,name in enumerate(names,1):
                root=E.fromstring(z.read(name));text=' '.join(x.text or '' for x in root.findall('.//a:t',NS));all_text.append(text)
                pic_names=[x.get('name','') for x in root.findall('.//p:pic/p:nvPicPr/p:cNvPr',NS)]
                en=[n for n in pic_names if n.startswith('UI_EN_')];ar=[n for n in pic_names if n.startswith('UI_AR_')]
                assert bool(en)==bool(ar) and len(en)==len(ar), f'Unpaired screenshot on slide {index}'
                if en:
                    assert [n.replace('UI_EN_','') for n in en]==[n.replace('UI_AR_','') for n in ar]
                    paired.append(index)
                native_tables+=len(root.findall('.//a:tbl',NS))
                for xfrm in root.findall('.//a:xfrm',NS):
                    off=xfrm.find('a:off',NS);ext=xfrm.find('a:ext',NS)
                    if off is not None and ext is not None:
                        x,y,cx,cy=[int(v) for v in (off.get('x'),off.get('y'),ext.get('cx'),ext.get('cy'))]
                        assert x>=-12700 and y>=-12700 and x+cx<=16256000+12700 and y+cy<=9144000+12700, f'Outside slide {index}'
            expected_pairs=[i for i,slide in enumerate(data['slides'],1) if slide['layout'] in ['story','ui']]
            expected_tables=sum(slide['layout'] in ['rubric','coverage','evaluation'] for slide in data['slides'])
            assert paired==expected_pairs and native_tables==expected_tables
            assert all(p in ' '.join(all_text) for p in data['team'])
            if data['slides'][-1]['layout']=='bilingualClosing':
                last=E.fromstring(z.read(names[-1]))
                closing=[n.get('name') for n in last.findall('.//p:pic/p:nvPicPr/p:cNvPr',NS)]
                assert closing==['CLOSING_EN','CLOSING_AR']
                embedded={hashlib.sha256(z.read(n)).digest() for n in z.namelist() if n.startswith('ppt/media/')}
                for language in ['en','ar']:
                    assert hashlib.sha256((ROOT/'submission/assets/closing'/('safety-'+language+'.jpg')).read_bytes()).digest() in embedded
            return {'slides':len(names),'pairedScreenshotSlides':paired,'editableTables':native_tables}
        root=E.fromstring(z.read('word/document.xml'));text=' '.join(x.text or '' for x in root.findall('.//w:t',NS))
        assert all(person in text for person in data['team'])
        assert all(weight in text for weight in ['30%','25%','20%','15%','10%'])
        assert 'No representative held-out detection benchmark has been completed' in text
        section=root.find('w:body/w:sectPr',NS)
        first_header=section.find("w:headerReference[@w:type='first']",NS)
        assert first_header is not None, 'Missing separate cover header'
        rels={r.get('Id'):r.get('Target') for r in E.fromstring(z.read('word/_rels/document.xml.rels'))}
        header_part='word/'+rels[first_header.get('{'+NS['r']+'}id')]
        header=z.read(header_part).lower()
        first_footer=section.find("w:footerReference[@w:type='first']",NS)
        footer=z.read('word/'+rels[first_footer.get('{'+NS['r']+'}id')]).lower() if first_footer is not None else b''
        assert b'0f1b3d' in header and b'087443' in header and b'c8102e' in header+footer, 'Cover background/accent colors missing'
        styles=E.fromstring(z.read('word/styles.xml'))
        for style in ['Normal','Heading1','Heading2','Title']:
            node=styles.find("w:style[@w:styleId='"+style+"']/w:pPr/w:jc",NS)
            assert node is None or node.get('{'+NS['w']+'}val')=='left'
        app=E.fromstring(z.read('docProps/app.xml'));pages=next(int(n.text) for n in app.iter() if n.tag.endswith('}Pages'))
        assert pages==12
        return {'pages':pages,'inlineImages':len(root.findall('.//w:drawing',NS)),'editableTables':len(root.findall('.//w:tbl',NS))}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--build',type=Path,required=True);parser.add_argument('--normalize-metadata',action='store_true');args=parser.parse_args()
    rubric=next(block['table'] for block in data['pages'][1]['blocks'] if 'table' in block)
    weights=[int(row[1].rstrip('%')) for row in rubric[1:]];assert sum(weights)==100
    results=[]
    for filename,title in [('TAAKAD_Judges_Presentation.pptx','TAAKAD competition presentation'),('TAAKAD_Project_Report.docx','TAAKAD project report')]:
        path=args.build/filename
        if args.normalize_metadata:normalize(path,title)
        result=inspect(path);result.update(file=filename,bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest());results.append(result)
    (args.build/'package-validation.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(results,indent=2))
