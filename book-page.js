/* Book sales presentation. Prices and eligibility remain server responsibilities in production. */
window.MANTRALO_BOOK = {
  render(prices, baht) {
    const fullCredit = Math.min(prices.book, prices.credit);
    const upgradePrice = Math.max(0, prices.course - fullCredit);
    const dots = '<div class="chakra-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';
    return `<div class="route-page bp-page">
      <section class="bp-hero">
        <div class="container bp-hero-grid">
          <div class="bp-showcase">
            <div class="bp-art-label"><span class="eyebrow">CHAKRA FOR EVERYDAY LIFE</span>${dots}</div>
            <div class="bp-product-pair">
              <div class="bp-printed-book"><img src="assets/book-new-edition.webp" width="617" height="900" alt="หนังสือ 7 วัน 7 จักระ New Edition ปกที่เจ้าของยืนยัน" fetchpriority="high"></div>
              <div class="bp-device"><span class="bp-device-camera" aria-hidden="true"></span><img src="assets/book-new-edition.webp" width="617" height="900" alt="ภาพจำลองการอ่านหนังสือดิจิทัล 7 วัน 7 จักระ"><span class="bp-device-bottom" aria-hidden="true"></span></div>
              <div class="bp-gift-tag"><span aria-hidden="true">＋</span><div><strong>แถมหนังสือดิจิทัล</strong><small>ฉบับเต็ม</small></div></div>
            </div>
            <div class="bp-art-caption"><span>หนังสือเล่มจริง</span><span class="bp-plus" aria-hidden="true">＋</span><span>หนังสือดิจิทัลสำหรับอ่านทบทวน</span></div>
            <p class="bp-source-caption">ปก New Edition ต้นฉบับ · ภาพอุปกรณ์จำลอง</p>
          </div>
          <div class="bp-hero-copy">
            <span class="pill bp-edition">NEW EDITION · ฉบับเพิ่มเติม</span>
            <p class="bp-brand-line">MANTRALO · 7 จังหวะกลับมาสู่ตัวเอง</p>
            <h1>7 วัน 7 จักระ</h1>
            <p class="bp-headline">เปิดอ่านทีละนิด<br>เว้นจังหวะให้ตัวเอง</p>
            <p class="bp-intro">หยิบหนังสือมาอ่านทีละส่วนในช่วงพัก ทำความรู้จักจักระทั้ง 7 แล้วเลือกแนวทางสมาธิหรือเรื่องสีที่สนใจไว้ลองเมื่อสะดวก จดสิ่งที่สังเกต แล้วค่อยกลับมาอ่านต่อในจังหวะของคุณ</p>
            <div class="bp-offer-box">
              <div class="bp-offer-heading"><strong>ซื้อชุดนี้ ได้ทั้งเล่มและหนังสือดิจิทัล</strong><span class="bp-price">${baht(prices.book)} <small>บาท</small></span></div>
              <ul class="bp-offer-list">
                <li><span class="bp-check" aria-hidden="true">✓</span><span><strong>หนังสือ 7 วัน 7 จักระ</strong><small>New Edition · พิมพ์ 4 สีทั้งเล่ม</small></span><span class="bp-inclusion">1 เล่ม</span></li>
                <li><span class="bp-check" aria-hidden="true">✓</span><span><strong>หนังสือดิจิทัล ฉบับเต็ม</strong><small>7 วัน 7 จักระ · อ่านเล่มเดียวกันบนอุปกรณ์ของคุณ</small></span><span class="bp-inclusion bp-free">แถมฟรี</span></li>
              </ul>
              <button class="button button-primary bp-main-cta" data-order="book">เลือกชุดหนังสือ ${baht(prices.book)} บาท</button>
              <p class="bp-shipping">ค่าส่ง 59 บาท · รวม 349 บาท ในประเทศพื้นที่ปกติ</p>
              <button type="button" class="text-link pd-hero-link" data-details-scroll="book-receive">ดูสิ่งที่ได้รับ วิธีรับไฟล์ และค่าส่ง</button>
            </div>
            <p class="bp-upgrade-hint"><span aria-hidden="true">✦</span> ถ้าอยากเรียนต่อ มีแผนใช้ยอดซื้อที่ตรวจสอบแล้วเป็นเครดิตคอร์ส สูงสุด ${baht(fullCredit)} บาทหนึ่งครั้ง</p>
            <a class="bp-free-entry" href="#/free-kit">เปิดคู่มือและกิจกรรมฟรีก่อนเลือกหนังสือ</a>
          </div>
        </div>
      </section>

      <section class="bp-promise-strip"><div class="container"><span><b>อ่านทีละส่วน</b> ในช่วงพักของวัน</span><span><b>แถมหนังสือดิจิทัล</b> เปิดทบทวนเรื่องที่สนใจ</span><span><b>ค่อยเรียนต่อ</b> สู่คอร์ส 12 บทเรียน</span></div></section>

      <section class="container bp-section" aria-labelledby="bp-included-title">
        <div class="bp-section-heading"><div><p class="eyebrow">ONE SET, TWO WAYS TO READ</p><h2 id="bp-included-title">ชุดหนังสือ ${baht(prices.book)} บาท ได้อะไรบ้าง?</h2></div><p>มีเล่มไว้ใกล้มือ และหนังสือดิจิทัลชื่อเดียวกัน<br>สำหรับกลับมาอ่านเรื่องที่อยากทบทวน</p></div>
        <div class="bp-included-grid">
          <article class="bp-included-main"><div class="bp-mini-book"><img src="assets/book-new-edition.webp" width="617" height="900" alt="ปกหนังสือ New Edition" loading="lazy"></div><div><span class="bp-kicker">สินค้าหลัก · หนังสือ 1 เล่ม</span><h3>จากพื้นฐาน สู่เรื่องที่อยากลอง</h3><p>หนังสือ 7 วัน 7 จักระ ฉบับเพิ่มเติม พิมพ์ 4 สีทั้งเล่ม รวมเรื่องจักระทั้ง 7 แนวทางสมาธิ สี และบทพิเศษเรื่องคริสตัลกับอัญมณี อ่านต่อเนื่องเพื่อเห็นภาพรวม หรือคั่นหน้าหัวข้อที่สนใจไว้กลับมาลองในวันถัดไป</p></div></article>
          <article class="bp-included-bonus"><span class="bp-bonus-seal">แถมฟรี</span><span class="bp-kicker">สิทธิ์ดิจิทัลสำหรับผู้ซื้อ</span><h3>หนังสือดิจิทัล 7 วัน 7 จักระ ฉบับเต็ม</h3><p>เนื้อหาหนังสือชื่อเดียวกันในรูปแบบดิจิทัล สำหรับเปิดอ่านทบทวนบนอุปกรณ์ของคุณเมื่อไม่ได้หยิบเล่มจริงมาด้วย</p><div class="bp-bonus-footer">รับรายละเอียดการเข้าอ่านหลังยืนยันรายการกับทีมงาน</div></article>
        </div>
        <div class="bp-total-row"><span>หนังสือเล่มจริง <b>＋</b> หนังสือดิจิทัล ฉบับเต็ม</span><strong>รวม ${baht(prices.book)} บาท <small>ไม่รวมค่าจัดส่ง</small></strong></div>
        <div class="bp-format-fit" aria-label="เลือกรูปแบบตามวิธีที่คุณอยากอ่าน">
          <article><span class="bp-kicker">วางไว้ใกล้มือ แล้วหยิบอ่านทีละช่วง</span><h3>เล่มพิมพ์ พร้อมหนังสือดิจิทัล</h3><p>อ่านจากหนังสือ 4 สี และใช้หนังสือดิจิทัลชื่อเดียวกันกลับมาทบทวน ชุด ${baht(prices.book)} บาท ค่าส่ง 59 บาท ในประเทศพื้นที่ปกติ แจ้งยอดรวมก่อนชำระ</p></article>
          <article><span class="bp-kicker">เปิดอ่านบนอุปกรณ์ โดยไม่ต้องรับพัสดุ</span><h3>ชุดเริ่มต้นดิจิทัล</h3><p>หนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็ม เนื้อหาหลักเล่มเดียวกัน ไม่มีเล่มพิมพ์ ราคาเสนอ ${baht(prices.digital ?? prices.book)} บาท รายละเอียดการจำหน่ายและส่งมอบรอยืนยัน ใช้ชุดเครื่องมือฟรีประกอบการอ่านได้เช่นกัน</p></article>
        </div>
      </section>

      ${window.MANTRALO_PURCHASE_DETAILS.book(prices)}
      <section class="bp-inside-section"><div class="container bp-inside-grid">
        <div><p class="eyebrow">SEVEN CHAKRAS, EVERYDAY MOMENTS</p><h2>7 จังหวะกลับมาสู่ตัวเอง<br>เริ่มจากเรื่องใกล้ตัว</h2><p class="bp-inside-intro">ใช้แนวคิดจักระทั้ง 7 เป็นมุมมองในการสังเกตชีวิตประจำวัน ตั้งแต่สิ่งที่ทำให้รู้สึกมั่นคงไปจนถึงการสื่อสาร เปิดอ่านหัวข้อที่ตรงกับความสนใจวันนี้ แล้วเลือกสิ่งเล็ก ๆ ไว้ลองตามแนวทางในหนังสือ</p><div class="bp-seven" aria-label="จักระทั้งเจ็ด"><span style="--c:#ef4444">ราก</span><span style="--c:#f97316">ท้องน้อย</span><span style="--c:#d5a61d">ลิ้นปี่</span><span style="--c:#27a56d">หัวใจ</span><span style="--c:#27a3d3">ลำคอ</span><span style="--c:#6655d0">ตาที่สาม</span><span style="--c:#a45cdb">มงกุฎ</span></div></div>
        <div class="bp-content-list"><article><span class="bp-topic-mark" aria-hidden="true">◉</span><div><h3>รู้จักจักระทั้ง 7 จากพื้นฐาน</h3><p>ทำความรู้จักจักระทั้ง 7 และหัวข้อที่เชื่อมโยงตามแนวคิดในหนังสือ เช่น ความมั่นคง ความคิดสร้างสรรค์ ความรัก และการสื่อสาร</p></div></article><article><span class="bp-topic-mark" aria-hidden="true">✧</span><div><h3>อ่านแนวทางสมาธิไว้ลองทีละอย่าง</h3><p>อ่านเรื่องสมาธิด้วยสี การสร้างภาพในใจ และแนวทางฝึกประกอบแต่ละจักระ เลือกหนึ่งเรื่องไว้ลอง แล้วจดสิ่งที่สังเกตในแบบของคุณ</p></div></article><article><span class="bp-topic-mark" aria-hidden="true">◇</span><div><h3>เปิดอ่านต่อในเรื่องที่สนใจ</h3><p>กลับมาทบทวนหัวข้อเดิม หรืออ่านบทพิเศษเรื่องคริสตัลกับอัญมณีในกรอบความเชื่อ โดยไม่ต้องซื้ออุปกรณ์เพิ่มเพื่อเริ่มอ่าน</p></div></article></div>
      </div></section>

      <section class="bp-daily-section" aria-labelledby="bp-daily-title"><div class="container">
        <div class="bp-section-heading"><div><p class="eyebrow">READ. TRY. NOTICE.</p><h2 id="bp-daily-title">ใช้หนังสือในวันธรรมดา<br>ด้วย 3 จังหวะเล็ก ๆ</h2></div><p>อ่าน ลอง และจดตามเวลาที่มี<br>ไม่ต้องทำครบทั้งหมดในครั้งเดียว</p></div>
        <ol class="bp-daily-grid">
          <li><span class="bp-daily-label">ระหว่างพัก</span><h3>อ่านทีละส่วน</h3><p>เลือกหนึ่งหัวข้อที่สนใจ เช่น พื้นฐานจักระหรือสมาธิสี อ่านช่วงสั้น ๆ แล้วคั่นหน้าที่อยากกลับมาทบทวน</p></li>
          <li><span class="bp-daily-label">ช่วงที่สะดวก</span><h3>เลือกฝึกในเวลาของคุณ</h3><p>หยิบแนวทางที่อ่านแล้วอยากลองมาเพียงหนึ่งอย่าง จัดช่วงเวลาเล็ก ๆ ให้ตัวเอง และปรับตามความสะดวกในวันนั้น</p></li>
          <li><span class="bp-daily-label">หลังลองกิจกรรม</span><h3>จดสิ่งที่สังเกต</h3><p>เขียนสั้น ๆ ว่ารู้สึกอย่างไร มีคำถามอะไร หรืออยากลองอะไรต่อ ใช้สมุดของตัวเองหรือบันทึกการฝึกที่เปิดให้โหลดฟรีก็ได้</p></li>
        </ol>
        <div class="bp-daily-footer"><p>เริ่มจากการพักสั้น ๆ ก่อนได้ มีขั้นตอนบนหน้าจอให้ลองทำตาม</p><a class="bp-free-entry" href="#/start">ลองกิจกรรมพัก 3 นาที</a></div>
      </div></section>

      <section class="container bp-section" aria-labelledby="bp-tools-title">
        <div class="bp-section-heading"><div><p class="eyebrow">LITTLE TOOLS TO HELP YOU BEGIN</p><h2 id="bp-tools-title">มีพื้นที่ไว้ลองและจด<br>ด้วยชุดเครื่องมือฟรี</h2></div><p>มีขั้นตอนให้ลอง เช็กลิสต์ และพื้นที่จดสิ่งที่สังเกต<br>ใช้คู่กับหนังสือหรือเริ่มเองก่อนซื้อก็ได้</p></div>
        <div class="bp-tools-grid">
          <article><span class="bp-paper-symbol" aria-hidden="true">▤</span><span class="bp-kicker">อ่านก่อนเริ่ม</span><h3>คู่มือเริ่มรู้จักจักระ</h3><p>คำแนะนำสั้น ๆ 5 หน้า สำหรับหาจุดเริ่มต้นของตัวเอง</p><a href="assets/free-kit/free-guide.pdf" download class="bp-tool-link">ดาวน์โหลดคู่มือ</a></article>
          <article><span class="bp-paper-symbol" aria-hidden="true">☑</span><span class="bp-kicker">เช็กอินกับตัวเอง</span><h3>Checklist ก่อน–หลังฝึก</h3><p>ช่วยสังเกตตัวเองก่อนเริ่มและหลังจบการฝึกแต่ละครั้ง</p><a href="assets/free-kit/checklist.pdf" download class="bp-tool-link">ดาวน์โหลด Checklist</a></article>
          <article><span class="bp-paper-symbol" aria-hidden="true">▦</span><span class="bp-kicker">ค่อย ๆ ทำต่อเนื่อง</span><h3>บันทึกการฝึก 7 วัน</h3><p>จดสิ่งที่สังเกต ความรู้สึก และสิ่งที่อยากลองทำต่อ</p><a href="assets/free-kit/journal.pdf" download class="bp-tool-link">ดาวน์โหลดบันทึก 7 วัน</a></article>
        </div>
        <p class="bp-draft-note">เครื่องมือทั้ง 3 ชิ้นเปิดให้ทุกคนใช้ฟรี ไม่ใช่ของแถมเฉพาะผู้ซื้อ ส่วนหนังสือดิจิทัลฉบับเต็มรวมอยู่ในชุดหนังสือ</p>
        <p class="bp-tools-more"><a class="bp-free-entry" href="#/free-kit">เปิดชุดฟรีพร้อมวิธีเริ่มฝึก</a></p>
      </section>

      <section class="bp-upgrade-section" aria-labelledby="bp-upgrade-title"><div class="container bp-upgrade-grid">
        <div class="bp-upgrade-copy"><span class="bp-upgrade-label">เมื่ออยากเรียนต่อ · ข้อเสนอคอร์สตามแผน</span><h2 id="bp-upgrade-title">จากเรื่องที่อ่าน<br>สู่ความเข้าใจทีละบท<br><em>คอร์ส 12 บทเรียน</em></h2><p>เมื่ออยากต่อความเข้าใจเป็นลำดับ เปิดดูสารบัญคอร์สจากพื้นฐานจักระทั้ง 7 ไปสู่แนวทางฝึก สมาธิสี และภาษาสีได้ก่อนเลือกเรียน ผู้ซื้อหนังสือที่ผ่านการตรวจสอบขอใช้เครดิตตามเงื่อนไขได้ โดยไม่จำเป็นต้องรีบเรียนต่อหลังอ่านจบ</p><a class="button button-light" href="#/course">ดูรายละเอียดคอร์ส 12 บทเรียน</a><a class="bp-sample-link" href="#/lesson-sample">ลองอ่านเอกสารจากบทเรียนจริงก่อน</a><p class="bp-sample-note">ตัวอย่าง PDF 2 หน้า จากบทภาษาสี ไม่ใช่บทเรียนฉบับเต็ม</p></div>
        <div class="bp-credit-card"><span class="bp-kicker">ตัวอย่างเมื่อใช้เครดิตเต็มจำนวน</span><div class="bp-credit-line"><span>ราคาคอร์ส 12 บทเรียน</span><strong>${baht(prices.course)} บาท</strong></div><div class="bp-credit-line bp-credit-saving"><span>หักเครดิตจากหนังสือ</span><strong>−${baht(fullCredit)} บาท</strong></div><div class="bp-credit-result"><span>จ่ายเพิ่มเพื่ออัปเกรด</span><strong>${baht(upgradePrice)} <small>บาท</small></strong></div><div class="bp-combined-total">หนังสือ ${baht(prices.book)} + อัปเกรด ${baht(upgradePrice)}<br><b>รวม ${baht(prices.book + upgradePrice)} บาท</b> <span>ไม่รวมค่าจัดส่ง</span></div><p class="bp-credit-terms">เครดิตตามยอดซื้อที่ตรวจสอบได้ สูงสุด ${baht(prices.credit)} บาท ใช้ได้หนึ่งครั้ง ค่าจัดส่งและสินค้าเพิ่มไม่รวมในเครดิต ราคาคอร์สและข้อเสนออัปเกรดรอยืนยันก่อนเปิดขาย</p></div>
      </div></section>

      <section class="container bp-section bp-steps-section" aria-labelledby="bp-steps-title"><div class="bp-section-heading"><div><p class="eyebrow">READ FIRST. GO FURTHER WHEN YOU ARE READY.</p><h2 id="bp-steps-title">อัปเกรดอย่างไร?</h2></div><p>เริ่มอ่านให้พอดีกับคุณ<br>ค่อยเลือกเรียนต่อเมื่อพร้อม</p></div><ol class="bp-upgrade-steps"><li><span class="bp-step-number">1</span><h3>เริ่มด้วยชุดหนังสือ</h3><p>เลือกชุด ${baht(prices.book)} บาท รับเล่มจริงพร้อมสิทธิ์อ่านหนังสือดิจิทัล และเก็บข้อมูลคำสั่งซื้อไว้</p></li><li><span class="bp-step-number">2</span><h3>แจ้งทีมงานเมื่ออยากเรียนต่อ</h3><p>ติดต่อ LINE @emcthai เพื่อให้ทีมงานตรวจสอบยอดซื้อและเครดิตที่เข้าเงื่อนไข</p></li><li><span class="bp-step-number">3</span><h3>ยืนยันส่วนต่างก่อนเรียน</h3><p>เมื่อได้เครดิตเต็ม ${baht(fullCredit)} บาท จะจ่ายเพิ่ม ${baht(upgradePrice)} บาท ตามข้อเสนอคอร์สที่ยืนยันแล้ว</p></li></ol><p class="bp-step-note">การซื้อหนังสือไม่บังคับให้ซื้อคอร์สต่อ และคอร์ส 12 บทเรียนไม่ได้รวมอยู่ในราคาหนังสือ ${baht(prices.book)} บาท</p></section>

      ${window.MANTRALO_EBOOK_OFFERS?.renderBridge?.('book') || ''}

      <section class="container bp-faq-section" aria-labelledby="bp-faq-title"><div><p class="eyebrow">ก่อนเลือกชุดของคุณ</p><h2 id="bp-faq-title">ตอบให้ชัด<br>ก่อนเริ่มอ่าน</h2><button class="text-link" data-contact>สอบถามทาง LINE</button></div><div class="faq-list"><details><summary>ยังไม่รู้จักจักระ เริ่มอ่านได้ไหม?</summary><p>เริ่มจากเนื้อหาพื้นฐานเรื่องจักระทั้ง 7 แล้วค่อยอ่านต่อเรื่องสมาธิและสีตามความสนใจได้ คุณเลือกอ่านทีละช่วงและกลับมาทบทวนหน้าเดิมได้ตามเวลาของตัวเอง หากอยากลองก่อน เปิดชุดคู่มือและกิจกรรมฟรีได้โดยไม่ต้องซื้อ</p><a class="bp-free-entry" href="#/free-kit">ลองชุดเริ่มต้นฟรี</a></details><details><summary>เล่มพิมพ์กับ ชุดเริ่มต้นดิจิทัล ต่างกันอย่างไร?</summary><p>ชุดเล่มพิมพ์ ${baht(prices.book)} บาทมีหนังสือจริงพร้อมหนังสือดิจิทัลชื่อเดียวกัน ค่าส่ง 59 บาท ในประเทศพื้นที่ปกติ ส่วน ชุดเริ่มต้นดิจิทัลราคาเสนอ ${baht(prices.digital ?? prices.book)} บาทมีหนังสือดิจิทัลฉบับเต็มโดยไม่มีเล่มพิมพ์ รายละเอียดส่งมอบรอยืนยัน เนื้อหาหลักเป็นเล่มเดียวกัน เลือกตามวิธีที่คุณอยากอ่านได้</p></details><details><summary>${baht(prices.book)} บาท รวมอะไร และต้องจ่ายเพิ่มไหม?</summary><p>ได้หนังสือ 7 วัน 7 จักระ New Edition 1 เล่ม พร้อม หนังสือดิจิทัล ฉบับเต็ม ค่าส่ง 59 บาท รวม 349 บาท ในประเทศพื้นที่ปกติ คอร์ส 12 บทเรียนเป็นการซื้อเพิ่มเติมเมื่อคุณต้องการเรียนต่อ</p></details><details><summary>ได้รับหนังสือดิจิทัลอย่างไร?</summary><p>ข้อเสนอรอยืนยัน: ส่งอีเมลพร้อมลิงก์เข้าคลังส่วนตัวภายใน 1 วันทำการหลังยืนยันยอดชำระ เสนอให้รับหนังสือดิจิทัลเป็น PDF สำหรับดาวน์โหลดส่วนตัว หากไม่พบอีเมล ให้ตรวจสแปมหรือติดต่อ LINE @emcthai พร้อมเลขคำสั่งซื้อ พรีวิวนี้ยังไม่ส่งอีเมลหรือเปิดสิทธิ์จริง</p></details><details><summary>Checklist และบันทึก 7 วัน เป็นของแถมเฉพาะผู้ซื้อหรือไม่?</summary><p>เป็นเครื่องมือที่ทุกคนดาวน์โหลดฟรีได้ ใช้เริ่มฝึกหรือประกอบการอ่านหนังสือ ส่วน หนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็มเป็นสิทธิ์ที่รวมมากับชุดหนังสือ แยกจากคู่มือเริ่มต้นฟรี 5 หน้า และไม่ใช่สิทธิ์อ่านหนังสือดิจิทัลทุกเล่ม</p></details><details><summary>ทุกคนซื้อคอร์สราคา ${baht(upgradePrice)} บาทได้เลยไหม?</summary><p>ราคานี้เป็นส่วนต่างตามแผนสำหรับผู้ที่ได้รับเครดิตเต็ม ${baht(fullCredit)} บาทแล้วเท่านั้น ต้องตรวจสอบยอดซื้อหนังสือหรือ ชุดเริ่มต้นดิจิทัล ที่เข้าเงื่อนไขก่อน ใช้เครดิตได้หนึ่งครั้ง และไม่รวมค่าจัดส่งหรือสินค้าเพิ่ม</p></details><details><summary>ถ้าพร้อมเรียนคอร์สเลย ต้องซื้อหนังสือก่อนไหม?</summary><p>ไม่จำเป็น แผนคอร์สราคา ${baht(prices.course)} บาทรวม ชุดเริ่มต้นดิจิทัลไว้แล้ว แต่ไม่ส่งหนังสือเล่มให้อัตโนมัติ เลือกเริ่มจากรูปแบบที่เหมาะกับคุณได้</p></details></div></section>

      <section class="bp-closing"><div class="container bp-closing-grid"><div><p class="eyebrow">A LITTLE SPACE IN YOUR EVERYDAY LIFE</p><h2>มีเรื่องให้อ่านต่อ<br>ในจังหวะของคุณ</h2><p>วางเล่มไว้ใกล้มือสำหรับช่วงพัก หรือเลือก ชุดเริ่มต้นดิจิทัลตามแผนเพื่ออ่านบนอุปกรณ์ ทั้งสองรูปแบบมีเนื้อหาหลักของหนังสือเล่มเดียวกัน เริ่มจากหนึ่งเรื่องที่สนใจ แล้วค่อยเลือกกิจกรรมไว้ลองเมื่อสะดวก</p><a class="bp-free-entry" href="#/free-kit">เริ่มจากคู่มือและกิจกรรมฟรีก่อนได้</a>${dots}</div><div class="bp-final-offer"><div class="format-picker" role="group" aria-label="เลือกรูปแบบหนังสือ"><button type="button" data-format="paper" aria-pressed="true" class="is-active"><strong>เล่มจริง + หนังสือดิจิทัล</strong><span>ชุดหนังสือ ${baht(prices.book)} บาท</span></button><button type="button" data-format="digital" aria-pressed="false"><strong>ดิจิทัลอย่างเดียว</strong><span>แพ็กเกจเสนอ รอยืนยัน</span></button></div><div class="book-price-line"><span id="book-price-value" class="price">${baht(prices.book)} <small>บาท</small></span><span id="book-price-label" class="pill">รวมหนังสือดิจิทัลฉบับเต็ม</span></div><p id="book-format-copy" class="format-copy">หนังสือ 7 วัน 7 จักระ New Edition 1 เล่ม พิมพ์ 4 สี พร้อม หนังสือดิจิทัล ฉบับเต็ม</p><p id="book-format-note" class="format-note">ค่าส่ง 59 บาท รวม 349 บาท ในประเทศพื้นที่ปกติ แจ้งกำหนดส่งก่อนชำระ</p><button id="book-order-label" class="button button-primary book-order-button" data-order="selected-book">เลือกชุดหนังสือ ${baht(prices.book)} บาท</button><p class="bp-local-note">ต้นแบบหน้าขาย · ยังไม่รับชำระเงิน</p></div></div></section>
      <div class="bp-mobile-buy"><div><strong id="bp-mobile-price">${baht(prices.book)} <small>บาท</small></strong><span id="bp-mobile-format">เล่มจริง + หนังสือดิจิทัล · ค่าส่ง 59 บาท</span></div><button id="bp-mobile-button" class="button button-primary" data-order="selected-book">เลือกชุดหนังสือ</button></div>
    </div>`;
  }
};
