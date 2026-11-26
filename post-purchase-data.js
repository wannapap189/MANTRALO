/* Presentation and email drafts only. No customer data, tokens or requests. */
window.MANTRALO_AFTER_PURCHASE = (() => {
  const products = {
    book: {name:'ชุดหนังสือ 7 วัน 7 จักระ',amount:'349',book:true,course:false,lines:[['หนังสือเล่ม พร้อมหนังสือดิจิทัลชื่อเดียวกัน','290 บาท'],['ค่าส่งในประเทศ พื้นที่ปกติ','59 บาท']]},
    digital: {name:'ชุดเริ่มต้นดิจิทัล 7 วัน 7 จักระ',amount:'290',book:false,course:false,lines:[['หนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็ม','290 บาท'],['ค่าจัดส่ง','ไม่มี']]},
    course: {name:'MANTRALO CORE · คอร์ส 12 บทเรียน',amount:'2,900',book:false,course:true,lines:[['คอร์ส 12 บท + ชุดเริ่มต้นดิจิทัล','2,900 บาท'],['ระยะเวลาเข้าเรียน','12 เดือนนับจากเปิดสิทธิ์']]},
    upgrade: {name:'อัปเกรด MANTRALO CORE · 12 บทเรียน',amount:'2,610',book:false,course:true,lines:[['ราคาคอร์ส','2,900 บาท'],['เครดิตเต็มที่ตรวจสอบแล้ว (ตัวอย่าง)','−290 บาท'],['ระยะเวลาเข้าเรียน','12 เดือนนับจากเปิดสิทธิ์']]}
  };
  const lessons=['บทนำพลังงานจักระ','จักระที่ 1','จักระที่ 2','จักระที่ 3','จักระที่ 4','จักระที่ 5','จักระที่ 6','จักระที่ 7','ฝึกเข้าถึงและรับพลังงาน','ฝึกควบคุมพลังงาน','สมาธิจักระสี','ภาษาสี และความหมายของภาษาสี'];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function email(product,status='ready',links={}){
    const p=products[product]||products.book;
    const pending=status==='pending';
    const subject=pending?'MANTRALO ได้รับรายการแล้ว — กำลังตรวจยอดชำระ':p.course?'เริ่มต้นคอร์ส MANTRALO 12 บท และรับหนังสือดิจิทัลของคุณ':'หนังสือดิจิทัล 7 วัน 7 จักระของคุณ พร้อมเปิดอ่านแล้ว';
    const intro=pending?'เราได้รับรายการของคุณแล้ว ทีมงานจะตรวจยอดชำระและรายการที่ซื้อก่อนเปิดสิทธิ์ คุณยังไม่ต้องชำระซ้ำ':'ทีมงานยืนยันยอดชำระและเปิดสิทธิ์ตามรายการของคุณแล้ว เริ่มอ่านหรือเรียนจากลิงก์ด้านล่างได้เลย';
    const paragraphs=[`สวัสดีคุณ {{customer_name}}`,intro,`รายการ: ${p.name}\nเลขคำสั่งซื้อ: {{order_number}}\nยอด${pending?'ที่ต้องตรวจสอบ':'ชำระ'}: ${p.amount} บาท`];
    if(product==='upgrade')paragraphs.push('ยอด 2,610 บาทใช้กับรายการที่ตรวจสอบและได้รับเครดิตเต็ม 290 บาทแล้วเท่านั้น เครดิตใช้ได้หนึ่งครั้ง ไม่รวมค่าส่งหรือสินค้าอื่น');
    if(pending)paragraphs.push('หลังยืนยันยอดชำระ เราจะส่งอีเมลอีกฉบับพร้อมลิงก์รับสิทธิ์ ตามข้อเสนอการส่งมอบภายใน 1 วันทำการหลังยืนยันยอดชำระ');
    else{
      paragraphs.push('รับหนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็ม 1 ชื่อเรื่องจากคลังส่วนตัวของคุณ ไม่รวมหนังสือดิจิทัลอีก 7 เล่ม');
      if(p.course)paragraphs.push('คอร์สครบ 12 บท เข้าเรียนได้ 12 เดือนนับจากเปิดสิทธิ์\nเริ่มสิทธิ์: {{access_starts_at}}\nสิ้นสุดสิทธิ์: {{access_expires_at}}\nไม่มีการต่ออายุหรือตัดเงินอัตโนมัติ');
      paragraphs.push('วิธีเข้าใช้: เปิดลิงก์ → ยืนยันตัวตนด้วยอีเมลเดียวกับคำสั่งซื้อ → เข้าคลังหนังสือหรือห้องเรียนตามสิทธิ์ ลิงก์นี้มีไว้สำหรับคุณ กรุณาไม่ส่งต่อ');
    }
    if(p.book)paragraphs.push('หนังสือเล่มจะจัดส่งแยกจากหนังสือดิจิทัล ค่าส่ง 59 บาทรวมอยู่ในยอด 349 บาทแล้ว เสนอให้เตรียมส่งภายใน 1–2 วันทำการหลังยืนยันยอดชำระ และแจ้งเลขติดตามเมื่อส่งออกจริง ระยะเวลาขนส่งขึ้นอยู่กับปลายทาง');
    paragraphs.push('หากเข้าไม่ได้: ตรวจว่าใช้อีเมลเดียวกับคำสั่งซื้อ หากลิงก์หมดอายุ ให้ขอลิงก์ใหม่จากหน้ารับสิทธิ์ หรือติดต่อ LINE @emcthai พร้อมเลขคำสั่งซื้อ โดยไม่ส่งรหัสผ่านหรือรหัสยืนยันให้ผู้อื่น','ขอบคุณที่ให้ MANTRALO เป็นส่วนหนึ่งของเวลาที่คุณกลับมาดูแลตัวเอง');
    const actions=pending?[]:[{label:'เปิดคลังหนังสือดิจิทัล',href:links.library||'{{library_access_url}}'},...(p.course?[{label:'เข้าสู่คอร์ส 12 บทเรียน',href:links.classroom||'{{course_access_url}}'}]:[])];
    const actionMarkup=actions.map(a=>`<p style="margin:24px 0"><a href="${escape(a.href)}" style="display:inline-block;background:#713395;color:#fff;border-radius:10px;text-decoration:none;padding:14px 22px;font-weight:bold">${a.label}</a></p>`).join('');
    const body=paragraphs.map(p=>(p.startsWith('วิธีเข้าใช้:')?actionMarkup:'')+`<p style="margin:0 0 20px;line-height:1.85;color:#483454">${escape(p).replace(/\n/g,'<br>')}</p>`).join('');
    const html=`<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(subject)}</title></head><body style="margin:0;background:#f7f2fb;font-family:Tahoma,Arial,sans-serif;font-size:16px"><div style="max-width:600px;margin:0 auto;padding:32px 24px;background:white"><p style="color:#713395;font-size:24px;font-weight:bold;margin:0 0 26px">MANTRALO</p><h1 style="color:#392544;font-size:24px;line-height:1.5">${escape(subject)}</h1>${body}<p style="border-top:1px solid #e6ddec;padding-top:20px;color:#65516f;font-size:14px">อีเมลเกี่ยวกับรายการสั่งซื้อและสิทธิ์ใช้งานของคุณ</p></div></body></html>`;
    return {subject,paragraphs,actions,html,text:subject+'\n\n'+paragraphs.join('\n\n')+'\n\n'+actions.map(a=>a.label+': '+a.href).join('\n')};
  }
  return Object.freeze({products,lessons,email,escape});
})();
