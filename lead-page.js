/* MANTRALO discovery hub. The knowledge game runs only in this page. */
(function () {
  'use strict';

  const quizUrl = 'https://chakra.emcthai.com/7-chakras-testing';
  const colours = [
    { id: 'red', name: 'สีแดง', colour: '#cb4059' },
    { id: 'orange', name: 'สีส้ม', colour: '#df7c34' },
    { id: 'yellow', name: 'สีเหลือง', colour: '#d9b331' },
    { id: 'green', name: 'สีเขียว', colour: '#4f936a' },
    { id: 'blue', name: 'สีฟ้า', colour: '#3d8caf' },
    { id: 'indigo', name: 'สีคราม', colour: '#5e55a4' },
    { id: 'violet', name: 'สีม่วง', colour: '#9954ae' }
  ];
  const questions = [
    { name: 'จักระฐานราก', location: 'บริเวณฐานกระดูกสันหลัง', answer: 'red', explanation: 'ในระบบจักระ 7 สี จักระฐานรากสัมพันธ์กับสีแดง เป็นจุดเริ่มต้นของลำดับจากฐานขึ้นไปสู่กระหม่อม' },
    { name: 'จักระท้องน้อย', location: 'บริเวณท้องน้อย', answer: 'orange', explanation: 'จักระที่ 2 สัมพันธ์กับสีส้ม อยู่ถัดขึ้นมาจากจักระฐานราก ลองจำลำดับแรกเป็น แดง แล้ว ส้ม' },
    { name: 'จักระลิ้นปี่', location: 'บริเวณลิ้นปี่', answer: 'yellow', explanation: 'จักระที่ 3 สัมพันธ์กับสีเหลือง สามสีแรกเรียงจากด้านล่างเป็น แดง ส้ม และเหลือง' },
    { name: 'จักระหัวใจ', location: 'บริเวณกลางหน้าอก', answer: 'green', explanation: 'ในลำดับ 7 สีที่ใช้ในเกมนี้ จักระหัวใจสัมพันธ์กับสีเขียว และอยู่ตรงกลางระหว่างจักระล่าง 3 จุดกับจักระบน 3 จุด' },
    { name: 'จักระลำคอ', location: 'บริเวณลำคอ', answer: 'blue', explanation: 'จักระที่ 5 สัมพันธ์กับสีฟ้า อยู่ถัดจากจักระหัวใจขึ้นมาบริเวณลำคอ' },
    { name: 'จักระตาที่สาม', location: 'บริเวณระหว่างคิ้ว', answer: 'indigo', explanation: 'จักระที่ 6 สัมพันธ์กับสีคราม ลองจำว่าครามเป็นสีระหว่างฟ้าของจักระลำคอกับม่วงของจักระกระหม่อม' },
    { name: 'จักระกระหม่อม', location: 'บริเวณยอดศีรษะ', answer: 'violet', explanation: 'ในลำดับ 7 สีที่ใช้ในเกมนี้ จักระกระหม่อมสัมพันธ์กับสีม่วง ครบลำดับ แดง ส้ม เหลือง เขียว ฟ้า คราม ม่วง' }
  ];
  const mounted = new WeakMap();
  const dots = '<span class="ld-spectrum" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';

  function render() {
    return `<div class="route-page ld-page">
      <div class="ld-preview">พื้นที่ทดลองของ MANTRALO · เริ่มสำรวจและลองฝึกได้ฟรี</div>
      <section class="ld-hero" aria-labelledby="ld-title"><div class="container ld-hero-grid">
        <div class="ld-hero-copy"><p class="ld-eyebrow">YOUR CURIOSITY IS A GOOD BEGINNING</p><h1 id="ld-title">เริ่มจากความอยากรู้<br><em>ให้ตัวเองได้ลองสักนิด</em></h1><p class="ld-hero-lead">จักระ สี สมาธิ และเวลาสั้น ๆ ที่คุณมีให้ตัวเอง<br>เลือกเริ่มจากแบบทดสอบ เกม หรือการฝึกฟรี<br>แล้วค่อยพบเส้นทางที่อยากเรียนรู้ต่อ</p><div class="ld-actions"><a class="button button-primary" href="${quizUrl}" target="_blank" rel="noopener noreferrer">เริ่มแบบทดสอบจักระฟรี</a><a class="ld-text-link" href="#/start">ลองฝึกสมาธิ 3 นาที</a></div><p class="ld-link-note">แบบทดสอบเปิดบนเว็บไซต์ EMC ในแท็บใหม่ และแสดงผลในระบบเดิม</p></div>
        <div class="ld-hero-art" aria-label="สีทั้ง 7 ของแนวคิดจักระ"><div class="ld-art-ring" aria-hidden="true"></div><div class="ld-art-center"><span>THE FIRST STEP</span><strong>รู้จัก<br>โลกข้างใน<br><em>อีกนิด</em></strong>${dots}</div><span class="ld-colour-orbit ld-orbit-red">01 · แดง</span><span class="ld-colour-orbit ld-orbit-orange">02 · ส้ม</span><span class="ld-colour-orbit ld-orbit-yellow">03 · เหลือง</span><span class="ld-colour-orbit ld-orbit-green">04 · เขียว</span><span class="ld-colour-orbit ld-orbit-blue">05 · ฟ้า</span><span class="ld-colour-orbit ld-orbit-indigo">06 · คราม</span><span class="ld-colour-orbit ld-orbit-violet">07 · ม่วง</span></div>
      </div></section>

      <section class="container ld-section" aria-labelledby="ld-begin-title"><div class="ld-section-heading"><div><p class="ld-eyebrow">THREE WAYS TO BEGIN</p><h2 id="ld-begin-title">วันนี้อยากเริ่มแบบไหน?</h2></div><p>ทุกจุดเริ่มต้นด้านล่างเปิดให้ลองฟรี<br>เลือกตามความสนใจและเวลาที่มีได้เลย</p></div><div class="ld-start-grid">
        <article class="ld-start-card ld-start-quiz"><span class="ld-card-number">01 / สำรวจ</span><h3>แบบทดสอบจักระ<br>จาก EMC</h3><p>ตอบคำถามในระบบแบบทดสอบเดิม แล้วอ่านคำอธิบายผลเพื่อใช้เป็นจุดเริ่มต้นในการทบทวนตัวเอง</p><a class="button button-primary" href="${quizUrl}" target="_blank" rel="noopener noreferrer">เปิดแบบทดสอบฟรี</a><small>เปิดเว็บไซต์ EMC ในแท็บใหม่</small></article>
        <article class="ld-start-card ld-start-practice"><span class="ld-card-number">02 / ลองฝึก</span><h3>มีเวลา 3 นาที<br>ให้ตัวเองไหม?</h3><p>เริ่มด้วยข้อความนำการฝึกและตัวจับเวลา สังเกตร่างกาย ลมหายใจ และสิ่งเล็ก ๆ ที่อยากใส่ใจในวันนี้</p><a class="button button-secondary" href="#/start">เริ่มฝึก 3 นาที</a><small>กิจกรรมบนเว็บ พักหรือหยุดได้ตามจังหวะของคุณ</small></article>
        <article class="ld-start-card ld-start-guide"><span class="ld-card-number">03 / อ่านและจด</span><h3>เอกสาร 3 ชิ้น<br>ให้ลองเริ่มต้น</h3><p>คู่มือเริ่มฝึก Checklist และบันทึก 7 วัน สำหรับเปิดอ่านและจดสิ่งที่สังเกตจากการฝึกของตัวเอง</p><a class="button button-secondary" href="#/free-kit">เปิดคู่มือและไฟล์ฟรี</a><small>คู่มือ Checklist และบันทึก เรียบเรียงใหม่สำหรับเริ่มฝึก</small></article>
      </div></section>

      <section class="ld-video-section" aria-labelledby="ld-video-title"><div class="container ld-video-grid"><div><p class="ld-eyebrow">A SHORT INTRODUCTION</p><h2 id="ld-video-title">ก่อนเริ่มแบบทดสอบ<br>แวะรู้จักกันสักนิด</h2><p>คลิปแนะนำแบบทดสอบจาก EMC เดิม ความยาวประมาณ 1 นาที 30 วินาที เปิดดูก่อนเลือกทำแบบทดสอบได้ค่ะ</p><span class="ld-media-label">คลิปแนะนำแบบทดสอบจาก EMC เดิม</span><p class="ld-video-context">คลิปนี้เป็นสื่อแนะนำแบบทดสอบ แยกจากบทเรียนในคอร์ส MANTRALO CORE 12 บท</p><a class="ld-text-link" href="${quizUrl}" target="_blank" rel="noopener noreferrer">พร้อมแล้ว เริ่มแบบทดสอบฟรี</a></div><div class="ld-video-frame"><video controls preload="metadata" poster="assets/videos/emc-quiz-introduction-poster.png" playsinline aria-label="คลิปแนะนำแบบทดสอบจักระจาก EMC เดิม"><source src="assets/videos/emc-quiz-introduction.mp4" type="video/mp4">เบราว์เซอร์นี้ไม่รองรับการเล่นวิดีโอ</video><p>กดเล่นเพื่อชมคลิป · ใช้ปุ่มควบคุมเพื่อหยุด ปรับเสียง หรือเปิดเต็มจอ</p></div></div></section>

      <section class="container ld-section ld-game-section" aria-labelledby="ld-game-heading"><div class="ld-section-heading"><div><p class="ld-eyebrow">A LITTLE PLAY. A LITTLE LEARNING.</p><h2 id="ld-game-heading">7 จักระ คู่กับสีอะไร?</h2></div><p>เกมจับคู่สั้น ๆ 7 ข้อ<br>ตอบทีละข้อ แล้วอ่านคำอธิบายประกอบ</p></div><div class="ld-game-shell" data-lead-game><div class="ld-game-intro"><span class="ld-game-label">เกมทบทวนความรู้</span><h3>จำสีได้<br>เข้าใจลำดับมากขึ้น</h3><p>เลือกสีที่สัมพันธ์กับจักระในคำถาม เกมนี้ใช้ลำดับสีจักระ 7 สี และจะเฉลยให้หลังตอบแต่ละข้อ</p>${dots}<p class="ld-game-note">คะแนนเป็นจำนวนคำตอบที่ถูกในเกม ไม่ใช่คะแนนพลังงานหรือผลประเมินสมดุลจักระของคุณ</p><button type="button" class="ld-text-button" data-game-reset>เริ่มเกมใหม่</button></div><div class="ld-game-stage"><div class="ld-game-progress"><label for="ld-game-progress">ข้อที่ <span data-game-number>1</span> จาก 7</label><span data-game-completed>ตอบแล้ว 0 ข้อ</span><progress id="ld-game-progress" value="0" max="7">0 / 7</progress></div><div data-game-content></div><div class="ld-game-feedback" data-game-feedback role="status" aria-live="polite" aria-atomic="true"></div><div class="ld-game-navigation"><button type="button" class="button button-primary" data-game-next hidden>ข้อถัดไป</button></div></div></div><p class="ld-game-footnote">ใช้เกมเพื่อเรียนรู้และทบทวนชื่อสี ส่วนการสำรวจตัวเองเลือกทำได้ที่แบบทดสอบ EMC ด้านบน</p></section>

      <section class="ld-continue" aria-labelledby="ld-continue-title"><div class="container"><div class="ld-section-heading"><div><p class="ld-eyebrow">WHEN YOU WANT TO GO A LITTLE DEEPER</p><h2 id="ld-continue-title">ถ้าอยากไปต่อ<br>มีเส้นทางให้เลือก</h2></div><p>อ่านในจังหวะของตัวเอง<br>หรือเรียนต่ออย่างเป็นลำดับ</p></div><div class="ld-continue-grid"><article class="ld-book-offer"><img src="assets/book-new-edition.webp" alt="ปกหนังสือ 7 วัน 7 จักระ New Edition" width="617" height="900" loading="lazy"><div><span class="ld-offer-label">เริ่มจากหนังสือ</span><h3>7 วัน 7 จักระ</h3><p>เปิดดูรายละเอียดหนังสือและสิ่งที่ได้รับ แล้วเลือกเริ่มอ่านในแบบที่เหมาะกับคุณ</p><strong class="ld-offer-price">290 <small>บาท</small></strong><a class="button button-secondary" href="#/book">ดูหนังสือ 290 บาท</a></div></article><article class="ld-course-offer"><span class="ld-offer-label">เรียนรู้เป็นเส้นทาง</span><h3>MANTRALO CORE</h3><p>คอร์ส 12 บท ตั้งแต่พื้นฐานและจักระทั้ง 7 ไปสู่การฝึกพลังงาน สมาธิจักระสี และภาษาสี</p><strong class="ld-offer-price">2,900 <small>บาท</small></strong><a class="button button-primary" href="#/course">ดูเนื้อหาและข้อเสนอคอร์ส</a><small>เครดิตจากหนังสือหรือ ชุดเริ่มต้นดิจิทัล ต้องตรวจสิทธิ์ก่อนยืนยันยอด</small></article></div><p class="ld-offer-note">ราคาข้อเสนอในเว็บต้นแบบ · ยังไม่เปิดรับชำระเงิน</p><div class="ld-member-bridge"><div><h3>อยากเห็นพื้นที่เรียนรู้ต่อ?</h3><p>เปิดดูตัวอย่างหน้าสมาชิกและการจัดบทเรียนได้ โดยยังไม่มีการลงทะเบียนหรือรับสิทธิ์เรียนจากหน้านี้</p></div><a class="ld-text-link" href="#/member">ดูตัวอย่างพื้นที่สมาชิก</a></div></div></section>

      <section class="ld-closing"><div class="container">${dots}<p class="ld-eyebrow">START WITH WHAT SPARKS YOUR CURIOSITY</p><h2>ไม่ต้องรู้ทุกอย่างก่อนเริ่ม<br><em>เริ่มจากสิ่งที่คุณอยากรู้วันนี้</em></h2><a class="button button-primary" href="${quizUrl}" target="_blank" rel="noopener noreferrer">เริ่มแบบทดสอบจักระฟรี</a><a class="ld-closing-link" href="#/start">หรือให้เวลาตัวเองฝึก 3 นาที</a></div></section>
    </div>`;
  }

  function mount(root) {
    if (!root || typeof root.querySelector !== 'function') return function () {};
    mounted.get(root)?.();
    const page = root.matches?.('.ld-page') ? root : root.querySelector('.ld-page');
    const game = page?.querySelector('[data-lead-game]');
    if (!game) return function () {};
    const controller = new AbortController();
    const content = game.querySelector('[data-game-content]');
    const feedback = game.querySelector('[data-game-feedback]');
    const next = game.querySelector('[data-game-next]');
    const number = game.querySelector('[data-game-number]');
    const completed = game.querySelector('[data-game-completed]');
    const progress = game.querySelector('progress');
    let index = 0;
    let score = 0;
    let answered = false;
    let finished = false;

    function focusHeading() {
      content.querySelector('[data-game-focus]')?.focus({ preventScroll: true });
    }

    function showQuestion(moveFocus) {
      const question = questions[index];
      answered = false;
      finished = false;
      number.textContent = String(index + 1);
      completed.textContent = `ตอบแล้ว ${index} ข้อ`;
      progress.value = index;
      progress.textContent = `${index} / 7`;
      content.innerHTML = `<div class="ld-question"><span class="ld-question-kicker">จักระที่ ${index + 1}</span><h3 id="ld-question-title" tabindex="-1" data-game-focus>${question.name}<br>สัมพันธ์กับสีอะไร?</h3><p>${question.location}</p></div><div class="ld-answer-grid" role="group" aria-labelledby="ld-question-title">${colours.map(colour => `<button type="button" class="ld-answer" data-game-answer="${colour.id}" style="--answer-colour:${colour.colour}"><i aria-hidden="true"></i><span>${colour.name}</span></button>`).join('')}</div>`;
      feedback.textContent = '';
      feedback.removeAttribute('data-feedback-state');
      next.hidden = true;
      next.textContent = index === questions.length - 1 ? 'ดูผลเกม' : 'ข้อถัดไป';
      if (moveFocus) focusHeading();
    }

    function showResult() {
      finished = true;
      number.textContent = '7';
      completed.textContent = 'ตอบครบแล้ว 7 ข้อ';
      progress.value = 7;
      progress.textContent = '7 / 7';
      const resultTitle = score === 7 ? 'จำสีครบทั้ง 7 จักระแล้ว' : 'ได้ทบทวนครบทั้ง 7 สีแล้ว';
      content.innerHTML = `<div class="ld-game-result"><span class="ld-game-label">จบเกมทบทวนสี–จักระ</span><h3 tabindex="-1" data-game-focus>${resultTitle}</h3><div class="ld-game-score"><strong>${score}</strong><span>จาก 7 ข้อที่ตอบถูก</span></div><p>นี่คือผลความรู้จากคำตอบในเกมครั้งนี้ ไม่ใช่ผลประเมินจักระหรือพลังงานของคุณ</p><ol class="ld-result-colours">${questions.map((question, questionIndex) => `<li><i style="--answer-colour:${colours[questionIndex].colour}" aria-hidden="true"></i><span>${questionIndex + 1}. ${question.name}</span><strong>${colours[questionIndex].name}</strong></li>`).join('')}</ol><div class="ld-result-actions"><button type="button" class="button button-secondary" data-game-reset>เล่นทบทวนอีกครั้ง</button><a class="ld-text-link" href="#/course">เรียนรู้ต่อในคอร์ส 12 บท</a></div></div>`;
      feedback.textContent = '';
      feedback.removeAttribute('data-feedback-state');
      next.hidden = true;
      focusHeading();
    }

    game.addEventListener('click', event => {
      const button = event.target instanceof Element ? event.target.closest('button') : null;
      if (!button || !game.contains(button)) return;
      if (button.hasAttribute('data-game-reset')) {
        index = 0;
        score = 0;
        showQuestion(true);
        return;
      }
      if (button.hasAttribute('data-game-next')) {
        if (!answered || finished) return;
        if (index === questions.length - 1) showResult();
        else { index += 1; showQuestion(true); }
        return;
      }
      if (!button.hasAttribute('data-game-answer') || answered || finished) return;
      const chosen = button.dataset.gameAnswer;
      if (!colours.some(colour => colour.id === chosen)) return;
      const question = questions[index];
      const correct = chosen === question.answer;
      answered = true;
      if (correct) score += 1;
      const correctColour = colours.find(colour => colour.id === question.answer);
      for (const answerButton of content.querySelectorAll('[data-game-answer]')) {
        const isCorrect = answerButton.dataset.gameAnswer === question.answer;
        const isChosen = answerButton === button;
        answerButton.disabled = true;
        answerButton.dataset.answerState = isCorrect ? 'correct' : isChosen ? 'incorrect' : 'unused';
        if (isCorrect) answerButton.insertAdjacentHTML('beforeend', '<small>คำตอบที่ถูก</small>');
        else if (isChosen) answerButton.insertAdjacentHTML('beforeend', '<small>ที่คุณเลือก</small>');
      }
      feedback.dataset.feedbackState = correct ? 'correct' : 'learn';
      feedback.innerHTML = `<strong>${correct ? `ถูกต้อง · ${correctColour.name}` : `คำตอบคือ ${correctColour.name}`}</strong><p>${question.explanation}</p>`;
      completed.textContent = `ตอบแล้ว ${index + 1} ข้อ`;
      progress.value = index + 1;
      progress.textContent = `${index + 1} / 7`;
      next.hidden = false;
    }, { signal: controller.signal });

    showQuestion(false);
    const cleanup = function () {
      controller.abort();
      page.querySelectorAll('video').forEach(video => video.pause());
      if (mounted.get(root) === cleanup) mounted.delete(root);
    };
    mounted.set(root, cleanup);
    return cleanup;
  }

  window.MANTRALO_LEAD = { render, mount };
})();
