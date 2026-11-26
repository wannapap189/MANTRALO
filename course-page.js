/* Course presentation. Lesson titles checked against the public EMC dashboard, 2026-11-19. MANTRALO retains the owner-confirmed 12-lesson scope. */
window.MANTRALO_COURSE = {
  render(prices, baht) {
    const credit = Math.min(prices.credit, prices.course);
    const upgrade = Math.max(0, prices.course - credit);
    const groups = [
      { label: 'วางพื้นฐาน', range: 'บทที่ 1', caption: 'เริ่มจากภาพรวม ก่อนลงรายละเอียด', color: '#9661c5', lessons: [
        ['บทนำพลังงานจักระ', 'ทำความเข้าใจแนวคิดและที่มาของระบบจักระ ก่อนเข้าสู่เนื้อหาเรื่องจักระแต่ละจุด', 'แนวคิดจักระ · ที่มาของระบบจักระ']
      ] },
      { label: 'รู้จักจักระทั้ง 7', range: 'บทที่ 2–8', caption: 'เรียนรู้ทีละจักระ ทีละมุมของตัวเอง', color: '#ce82a7', lessons: [
        ['จักระที่ 1', 'เรียนรู้แนวคิดของจักระที่ 1 ความสัมพันธ์กับสี และเครื่องมือประกอบการฝึกที่กล่าวถึงในบท', 'จักระราก · สี · แนวทางฝึก'],
        ['จักระที่ 2', 'ทำความรู้จักจักระที่ 2 ความหมายของสี และแนวทางฝึกตามเนื้อหาของจักระนี้', 'จักระท้องน้อย · สี · แนวทางฝึก'],
        ['จักระที่ 3', 'สำรวจเนื้อหาจักระที่ 3 เชื่อมความเข้าใจเรื่องสีเข้ากับเครื่องมือประกอบการฝึก', 'จักระลิ้นปี่ · สี · แนวทางฝึก'],
        ['จักระที่ 4', 'เรียนรู้แนวคิดจักระที่ 4 สีที่สัมพันธ์กัน และเครื่องมือประกอบการฝึกตามบทเรียน', 'จักระหัวใจ · สี · แนวทางฝึก'],
        ['จักระที่ 5', 'ทำความเข้าใจจักระที่ 5 พร้อมเนื้อหาเรื่องสีและแนวทางฝึกที่เกี่ยวข้อง', 'จักระลำคอ · สี · แนวทางฝึก'],
        ['จักระที่ 6', 'เรียนรู้จักระที่ 6 ความหมายของสี และเครื่องมือประกอบการฝึกในหลักสูตร', 'จักระตาที่สาม · สี · แนวทางฝึก'],
        ['จักระที่ 7', 'ทำความเข้าใจจักระที่ 7 พร้อมทบทวนสีและแนวทางฝึกของจักระนี้', 'จักระมงกุฎ · สี · แนวทางฝึก']
      ] },
      { label: 'เรียนรู้การฝึกพลังงาน', range: 'บทที่ 9–10', caption: 'ต่อยอดความเข้าใจ สู่แนวทางฝึก', color: '#699cb4', lessons: [
        ['ฝึกเข้าถึงและรับพลังงาน', 'เรียนรู้แนวคิดและเทคนิคการรับและเชื่อมโยงพลังงานตามคำอธิบายในหลักสูตร', 'การรับรู้ · การเชื่อมโยงพลังงาน'],
        ['ฝึกควบคุมพลังงาน', 'ศึกษาวิธีฝึกควบคุมพลังงานตามแนวทางของหลักสูตร เพื่อทำความเข้าใจลำดับการฝึกต่อจากบทก่อน', 'แนวทางควบคุมพลังงาน · ลำดับการฝึก']
      ] },
      { label: 'สมาธิและภาษาสี', range: 'บทที่ 11–12', caption: 'เชื่อมจักระ สี และการทำสมาธิ', color: '#8567c6', lessons: [
        ['สมาธิจักระสี', 'เรียนรู้แนวทางทำสมาธิด้วยสีจักระตามเนื้อหาของหลักสูตร', 'สมาธิสี · แนวทางฝึกตามบทเรียน'],
        ['ภาษาสี และความหมายของภาษาสี', 'เรียนรู้ภาษาสีและความหมายของสีที่สัมพันธ์กับจักระที่ 1–3 และจักระที่ 4–7', 'ความหมายของสี · จักระทั้ง 7']
      ] }
    ];
    let lessonNumber = 0;
    const modules = groups.map(group => `<section class="cp-module" style="--module-color:${group.color}"><div class="cp-module-heading"><span>${group.range}</span><h3>${group.label}</h3><p>${group.caption}</p></div><div class="cp-module-lessons">${group.lessons.map(lesson => {lessonNumber += 1; return `<details class="cp-lesson" data-course-lesson><summary><span class="cp-lesson-number">${String(lessonNumber).padStart(2,'0')}</span><span class="cp-lesson-title">${lesson[0]}</span><span class="cp-expand-sign" aria-hidden="true"></span></summary><div class="cp-lesson-content"><p>${lesson[1]}</p><span>${lesson[2]}</span></div></details>`;}).join('')}</div></section>`).join('');
    return window.MANTRALO_COURSE_STORY.render({ prices, baht, credit, upgrade, modules });
  }
};
