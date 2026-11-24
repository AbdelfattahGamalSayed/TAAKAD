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
            assert len(names)==16
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
            assert len(paired)==8 and native_tables==3
            assert all(p in ' '.join(all_text) for p in data['team'])
            assert all(weight in all_text[1] for weight in ['30%','25%','20%','15%','10%'])
            return {'slides':16,'pairedScreenshotSlides':paired,'editableTables':native_tables}
        root=E.fromstring(z.read('word/document.xml'));text=' '.join(x.text or '' for x in root.findall('.//w:t',NS))
        assert all(person in text for person in data['team'])
        assert all(weight in text for weight in ['30%','25%','20%','15%','10%'])
        assert 'No representative held-out detection benchmark has been completed' in text
        styles=E.fromstring(z.read('word/styles.xml'))
        for style in ['Normal','Heading1','Heading2','Title']:
            node=styles.find("w:style[@w:styleId='"+style+"']/w:pPr/w:jc",NS)
            assert node is None or node.get('{'+NS['w']+'}val')=='left'
        app=E.fromstring(z.read('docProps/app.xml'));pages=next(int(n.text) for n in app.iter() if n.tag.endswith('}Pages'))
        assert pages==12
        return {'pages':pages,'inlineImages':len(root.findall('.//w:drawing',NS)),'editableTables':len(root.findall('.//w:tbl',NS))}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--build',type=Path,required=True);parser.add_argument('--normalize-metadata',action='store_true');args=parser.parse_args()
    weights=[int(row[1].rstrip('%')) for row in data['slides'][1]['rows']];assert sum(weights)==100
    results=[]
    for filename,title in [('TAAKAD_Judges_Presentation.pptx','TAAKAD competition presentation'),('TAAKAD_Project_Report.docx','TAAKAD project report')]:
        path=args.build/filename
        if args.normalize_metadata:normalize(path,title)
        result=inspect(path);result.update(file=filename,bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest());results.append(result)
    (args.build/'package-validation.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(results,indent=2))
