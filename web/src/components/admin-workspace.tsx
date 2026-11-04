"use client";

import Link from "next/link";
import {useEffect,useRef,useState,type ReactNode} from "react";
import {LayoutDashboard,MapPin,Recycle,BookOpen,MoreHorizontal,ChevronDown,Menu,PanelLeftClose,X} from "lucide-react";
import {adminGroups,adminTitle} from "@/lib/admin-navigation";
import "./admin-workspace.css";

const icons=[MapPin,Recycle,BookOpen,MoreHorizontal];
export default function AdminWorkspace({section,children}:{section:string;children:ReactNode}){
  const activeGroup=adminGroups.find(g=>g.items.some(([path])=>path===section))?.id;
  const [expanded,setExpanded]=useState<string[]>(activeGroup?[activeGroup]:[]);
  const [collapsed,setCollapsed]=useState(false);
  const [open,setOpen]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
  useEffect(()=>{
    const desktop=window.matchMedia('(min-width: 901px)');
    const closeOnDesktop=()=>{if(desktop.matches)setOpen(false);};
    desktop.addEventListener('change',closeOnDesktop);
    return()=>desktop.removeEventListener('change',closeOnDesktop);
  },[]);
  useEffect(()=>{if(activeGroup)setExpanded(previous=>previous.includes(activeGroup)?previous:[...previous,activeGroup]);},[activeGroup]);
  function navigation(compact=false,scope="desktop"){return <nav aria-label="เมนูผู้ดูแลระบบ">
    <Link className={`aw-row ${section==="overview"?"aw-active":""}`} href="/admin/overview" aria-current={section==="overview"?"page":undefined} title="ภาพรวม" onClick={()=>setOpen(false)}><LayoutDashboard aria-hidden="true"/><span>ภาพรวม</span></Link>
    {adminGroups.map((group,index)=>{const Icon=icons[index];const isExpanded=expanded.includes(group.id)&&!compact;return <div className="aw-group" key={group.id}>
      <button type="button" className={`aw-row ${activeGroup===group.id?"aw-current-group":""}`} title={group.label} aria-label={group.label} aria-expanded={isExpanded} aria-controls={`aw-${scope}-${group.id}`} onClick={()=>{if(compact){setCollapsed(false);setExpanded([group.id]);}else setExpanded(previous=>previous.includes(group.id)?previous.filter(id=>id!==group.id):[...previous,group.id]);}}><Icon aria-hidden="true"/><span>{group.label}</span><ChevronDown className={isExpanded?"aw-chevron aw-rotated":"aw-chevron"} aria-hidden="true"/></button>
      <div id={`aw-${scope}-${group.id}`} className="aw-submenu" hidden={!isExpanded}>{group.items.map(([path,label])=><Link key={path} href={`/admin/${path}`} className={section===path?"aw-active":""} aria-current={section===path?"page":undefined} onClick={()=>setOpen(false)}>{label}</Link>)}</div>
    </div>;})}
  </nav>;}
  return <div data-section={section} className={`admin-workspace ${collapsed?"aw-collapsed":""}`}>
    <aside className="aw-sidebar"><div className="aw-brand"><span>RECYCLE BIN<small>พื้นที่ผู้ดูแลระบบ</small></span><button type="button" className="aw-icon" aria-label={collapsed?"ขยาย Sidebar":"ยุบ Sidebar"} onClick={()=>setCollapsed(!collapsed)}>{collapsed?<Menu/>:<PanelLeftClose/>}</button></div>{navigation(collapsed)}</aside>
    <div className="aw-content"><header className="aw-heading"><button type="button" className="aw-icon aw-hamburger" aria-label="เปิดเมนูผู้ดูแล" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><Menu/></button><div><div className="eyebrow">ADMIN WORKSPACE</div><h1>{adminTitle(section)}</h1><p>จัดการข้อมูลอ้างอิง สมาชิก และประวัติการใช้งานของโครงงาน</p></div></header>{children}</div>
    <dialog ref={dialog} className="aw-drawer" aria-label="เมนูผู้ดูแลระบบ" onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} onClick={event=>{if(event.target===event.currentTarget)setOpen(false);}}><div className="aw-drawer-inner"><div className="aw-brand"><span>RECYCLE BIN<small>พื้นที่ผู้ดูแลระบบ</small></span><button type="button" className="aw-icon" aria-label="ปิดเมนูผู้ดูแล" onClick={()=>setOpen(false)}><X/></button></div>{open&&navigation(false,"drawer")}</div></dialog>
  </div>;
}
