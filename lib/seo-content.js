import { MAX_FILE_MB, RETENTION_LABEL } from "@/lib/site"

/**
 * Search-focused copy for every tool page: title, description, an intro,
 * how-to steps, short notes and FAQs. Keep claims in step with what the backend really does.
 */
export const TOOL_SEO = {
  merge: {
    title: "Merge PDF Online Free: Combine PDF Files",
    description:
      "Merge multiple PDF files into one document online for free. Add your PDFs, arrange the order and download a single combined PDF in seconds.",
    h1: "Merge PDF files online",
    intro:
      "Combine several PDFs into one document without installing anything. Add your files, put them in the order you want, and download a single clean PDF. It works well for reports, contracts, receipts and coursework that need to be sent as one file.",
    how: "How to merge PDF files",
    steps: [
      "Add two or more PDF files by dragging them in or browsing your device.",
      "Use the arrows to put the files in the order you want. They are merged from top to bottom.",
      "Select Merge PDFs, then download the combined file.",
    ],
    points: [
      "The pages inside each file keep their original order.",
      "Mix any PDFs together and reorder them before you merge.",
      "Works on phones, tablets and computers.",
    ],
    faqs: [
      { q: "Can I change the order of the files?", a: "Yes. Use the arrows next to each file to move it up or down before merging. Files are merged from top to bottom." },
      { q: "Will merging reduce the quality?", a: "No. Pages are copied into the new document as they are, so text and images keep their original quality." },
      { q: "How many files can I merge?", a: `You need at least two files. Each file can be up to ${MAX_FILE_MB} MB.` },
    ],
  },
  split: {
    title: "Split PDF Online Free: Extract Pages from a PDF",
    description:
      "Split a PDF online for free. Choose a page range, extract it into a new PDF and download it in seconds. No software to install.",
    h1: "Split PDF and extract pages",
    intro:
      "Pull the pages you need out of a larger PDF. Enter the first and last page of the range and PaperLess creates a new PDF containing just those pages, ready to download.",
    how: "How to split a PDF",
    steps: [
      "Add the PDF you want to split.",
      "Enter the first and last page of the range you want to keep.",
      "Select Split PDF and download the new file.",
    ],
    points: [
      "Your original file isn't changed.",
      "To get a single page, use the same number in both boxes.",
      "Need several ranges? Run the tool again with a different range.",
    ],
    faqs: [
      { q: "Can I extract a single page?", a: "Yes. Enter the same page number in both boxes, for example 5 and 5." },
      { q: "Does splitting change the original PDF?", a: "No. You get a new PDF with the selected pages, and your original file stays as it is on your device." },
      { q: "What if my page range is wrong?", a: "The last page must be the same as or after the first page. If the range doesn't fit your document, you'll see an error and can try again." },
    ],
  },
  reorder: {
    title: "Reorder PDF Pages Online: Rearrange PDF Pages",
    description:
      "Rearrange the pages of a PDF online for free. Enter the new page order, such as 3, 1, 2, and download the reordered PDF.",
    h1: "Reorder PDF pages",
    intro:
      "Put the pages of a PDF in a new sequence. Type the page numbers in the order you want them to appear and PaperLess builds a new PDF in that order.",
    how: "How to rearrange PDF pages",
    steps: [
      "Add your PDF.",
      "Type the new page order as numbers separated by commas, for example 3, 1, 2.",
      "Select Reorder pages and download the result.",
    ],
    points: [
      "Separate page numbers with commas.",
      "Page numbers start at 1.",
      "Check the page count of your PDF first so every number exists.",
    ],
    faqs: [
      { q: "How do I write the page order?", a: "Use page numbers separated by commas. For a four-page PDF where you want the last page first, enter 4, 1, 2, 3." },
      { q: "Can I rotate pages here?", a: "Not in this tool, but the Rotate PDF tool can turn every page by 90, 180 or 270 degrees." },
    ],
  },
  rotate: {
    title: "Rotate PDF Online Free: Turn PDF Pages",
    description:
      "Rotate a PDF online for free. Turn every page by 90, 180 or 270 degrees and download the corrected file.",
    h1: "Rotate PDF pages",
    intro:
      "Fix a sideways or upside-down document. Choose how far to turn it and PaperLess rotates every page and gives you a new PDF to download.",
    how: "How to rotate a PDF",
    steps: [
      "Add your PDF.",
      "Choose 90° clockwise, 180° or 90° counter-clockwise.",
      "Select Rotate PDF and download the result.",
    ],
    points: [
      "The rotation applies to every page of the document.",
      "Handy for scans that came out sideways.",
    ],
    faqs: [
      { q: "Can I rotate only one page?", a: "Not at the moment. This tool turns every page by the same amount." },
      { q: "Does rotating change the quality?", a: "No. Rotating changes the page orientation only." },
    ],
  },
  compress: {
    title: "Compress PDF Online Free: Reduce PDF File Size",
    description:
      "Compress PDF files online for free. Choose light, recommended or extreme compression to reduce PDF size for email and uploads.",
    h1: "Compress PDF to reduce file size",
    intro:
      "Make a large PDF small enough to email or upload. Pick a compression level and PaperLess creates a smaller copy while keeping it readable.",
    how: "How to compress a PDF",
    steps: [
      "Add your PDF.",
      "Choose Light (best quality), Recommended or Extreme (smallest size).",
      "Select Compress PDF and download the smaller file.",
    ],
    points: [
      "Start with Recommended, then go lighter or stronger if you need to.",
      "PDFs full of photos shrink the most.",
      "Your original file is untouched.",
    ],
    faqs: [
      { q: "How much smaller will my PDF get?", a: "It depends on the content. PDFs with large images usually shrink a lot, while text-only files are already small and change less." },
      { q: "Which compression level should I use?", a: "Recommended is a good balance. Use Light if quality matters most and Extreme when file size is the priority." },
      { q: "Will the text stay readable?", a: "Text normally stays readable at every level. Extreme can noticeably reduce image quality." },
    ],
  },
  watermark: {
    title: "Add Watermark to PDF Online: Free Text Watermark",
    description:
      "Add a text watermark to every page of your PDF online for free. Stamp CONFIDENTIAL, DRAFT or your own text in seconds.",
    h1: "Add a watermark to PDF",
    intro:
      "Stamp a line of text across every page of a PDF, such as DRAFT, CONFIDENTIAL or a name. It's handy for sharing documents for review while making their status clear.",
    how: "How to watermark a PDF",
    steps: [
      "Add your PDF.",
      "Type the watermark text.",
      "Select Add watermark and download the result.",
    ],
    points: [
      "The watermark goes on every page.",
      "Keep the text short so it fits across the page.",
      "Your original file stays unchanged.",
    ],
    faqs: [
      { q: "Can I add an image or logo watermark?", a: "At the moment only text watermarks are supported." },
      { q: "Can I remove the watermark afterwards?", a: "The new PDF has the watermark on its pages, so keep your original file safe if you may need a clean copy." },
    ],
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF Online Free",
    description:
      "Add page numbers to a PDF online for free. Choose the position, add optional text like Page, and download the numbered PDF.",
    h1: "Add page numbers to PDF",
    intro:
      "Number every page of a document so it's easier to reference and print. Choose where the number goes and add optional text before it, such as “Page ”.",
    how: "How to add page numbers to a PDF",
    steps: [
      "Add your PDF.",
      "Choose the position (bottom center, bottom right or top center) and any text before the number.",
      "Select Add page numbers and download the result.",
    ],
    points: [
      "Every page of the PDF is numbered.",
      "Leave the text box empty to show the number on its own.",
    ],
    faqs: [
      { q: "Can I add text like “Page 1”?", a: "Yes. Type “Page ” in the text box and it appears before each number." },
      { q: "Can I start numbering from a later page?", a: "Not currently. The tool numbers every page of the PDF." },
    ],
  },
  protect: {
    title: "Password Protect PDF Online Free",
    description:
      "Password protect a PDF online for free. Set a password so only people who know it can open your document.",
    h1: "Protect PDF with a password",
    intro:
      "Lock a PDF so it asks for a password every time it's opened. Choose a password and PaperLess creates a protected copy you can download and share.",
    how: "How to password protect a PDF",
    steps: [
      "Add your PDF.",
      "Choose a password.",
      "Select Protect PDF and download the protected file.",
    ],
    points: [
      "Use a strong password that you can remember.",
      "A forgotten password can't be recovered, so store it somewhere safe.",
    ],
    faqs: [
      { q: "What if I forget the password?", a: "PaperLess can't recover it. Keep the password somewhere safe, and keep an unprotected copy of the original if you may need it." },
      { q: "Is my password sent securely?", a: "Yes. It travels over an encrypted HTTPS connection and is only used to protect your file." },
      { q: "Who can open the protected PDF?", a: "Anyone who knows the password can open it in a standard PDF reader." },
    ],
  },
  unlock: {
    title: "Unlock PDF Online: Remove PDF Password",
    description:
      "Remove the password from a PDF you own. Enter the current password and download an unlocked copy that opens without one.",
    h1: "Unlock PDF and remove its password",
    intro:
      "Tired of typing a password every time you open a document? If you know the current password, PaperLess removes it and gives you a copy that opens freely.",
    how: "How to unlock a PDF",
    steps: [
      "Add the password-protected PDF.",
      "Enter its current password.",
      "Select Unlock PDF and download the unlocked file.",
    ],
    points: [
      "You need the current password. This tool can't guess or crack passwords.",
      "Only unlock files you own or have permission to change.",
    ],
    faqs: [
      { q: "Can you unlock a PDF if I forgot the password?", a: "No. The tool needs the correct current password and doesn't guess or bypass passwords." },
      { q: "Which files should I unlock?", a: "Only use it on documents you own or have permission to change." },
    ],
  },
  "images-to-pdf": {
    title: "JPG to PDF and PNG to PDF: Convert Images to PDF",
    description:
      "Convert JPG and PNG images to a single PDF online for free. Add your pictures, set the order and download one PDF.",
    h1: "Convert images to PDF",
    intro:
      "Turn photos, screenshots and scans into one PDF. Add your JPG or PNG images, arrange them in order, and PaperLess combines them into a single document.",
    how: "How to convert images to PDF",
    steps: [
      "Add one or more JPG or PNG images.",
      "Use the arrows to set the order.",
      "Select Create PDF and download the result.",
    ],
    points: [
      "Supports JPG, JPEG and PNG images.",
      "Images are combined in the order you choose.",
    ],
    faqs: [
      { q: "Which image formats are supported?", a: "JPG, JPEG and PNG." },
      { q: "Can I put several images in one PDF?", a: "Yes. Add as many images as you need and arrange them with the arrows. They are combined into one PDF in that order." },
    ],
  },
  "pdf-to-images": {
    title: "PDF to Images Online: Convert PDF Pages to Images",
    description:
      "Convert every page of a PDF to an image online for free. Download all the pages in a single ZIP file.",
    h1: "Convert PDF to images",
    intro:
      "Save each page of a PDF as its own image. PaperLess processes the document and packs every page into a ZIP file for a single download.",
    how: "How to convert a PDF to images",
    steps: [
      "Add your PDF.",
      "Select Extract images.",
      "Download the ZIP file and unzip it to get your images.",
    ],
    points: [
      "Every page becomes its own image.",
      "Everything arrives in one ZIP, so there's a single download.",
    ],
    faqs: [
      { q: "Can I convert only some pages?", a: "Not at the moment. All pages are converted. Use Split PDF first if you only need a range." },
      { q: "How do I open the result?", a: "The download is a ZIP file. Unzip it on your device to see the page images." },
    ],
  },
  "pdf-to-word": {
    title: "PDF to Word Converter Free: Convert PDF to DOCX",
    description:
      "Convert PDF to editable Word (DOCX) online for free. Upload your PDF and download a Word document you can edit.",
    h1: "Convert PDF to Word",
    intro:
      "Turn a PDF into an editable Word document. PaperLess extracts the text and layout from your PDF and creates a .docx file you can open in Microsoft Word, Google Docs or LibreOffice.",
    how: "How to convert a PDF to Word",
    steps: [
      "Add your PDF.",
      "Select Convert to Word.",
      "Download the .docx file and open it in your word processor.",
    ],
    points: [
      "Works best on PDFs with real text, such as documents exported from Word.",
      "Complex layouts may need a little tidying after conversion.",
      "Scanned PDFs are pictures of pages, so there is no text to extract.",
    ],
    faqs: [
      { q: "Will the formatting stay exactly the same?", a: "Simple documents convert well. Complex layouts with many columns, tables or special fonts may need a little tidying in Word." },
      { q: "Can I convert a scanned PDF?", a: "Scanned PDFs are images, so there is no text to extract. PaperLess doesn't do OCR yet, so scanned files won't become editable text." },
      { q: "Which file do I get?", a: "A .docx file that opens in Microsoft Word, Google Docs and LibreOffice." },
    ],
  },
  "word-to-pdf": {
    title: "Word to PDF Converter Free: DOCX to PDF",
    description:
      "Convert Word documents (.docx) to PDF online for free. Upload your file and download a PDF you can share or print.",
    h1: "Convert Word to PDF",
    intro:
      "Turn a Word document into a PDF you can share with confidence. Upload your .docx file and PaperLess creates a PDF that opens on any device.",
    how: "How to convert Word to PDF",
    steps: [
      "Add your .docx file.",
      "Select Create PDF.",
      "Download the PDF.",
    ],
    points: [
      "Supports .docx files.",
      "If your document uses unusual fonts, check the PDF to make sure it looks right.",
    ],
    faqs: [
      { q: "Does it support old .doc files?", a: "Only .docx. Open an older .doc file in Word and save it as .docx first." },
      { q: "Will my layout be preserved?", a: "Most documents convert well. Documents with unusual fonts or complex layouts are worth checking after conversion." },
    ],
  },
  "pdf-to-excel": {
    title: "PDF to Excel Converter: Extract Tables from PDF",
    description:
      "Extract tables from a PDF into an Excel spreadsheet online for free. Upload your PDF and download an .xlsx file.",
    h1: "Convert PDF to Excel",
    intro:
      "Pull tables out of a PDF and into a spreadsheet so you can sort, filter and calculate. PaperLess reads the tables in your PDF and saves them to an .xlsx file.",
    how: "How to convert a PDF to Excel",
    steps: [
      "Add your PDF.",
      "Select the convert button.",
      "Download the .xlsx file and open it in Excel or Google Sheets.",
    ],
    points: [
      "Works best on PDFs with clearly structured tables.",
      "Scanned PDFs aren't supported because they have no text to read.",
    ],
    faqs: [
      { q: "Will every table be detected?", a: "Clean, well-structured tables work best. Tables with merged cells or unusual layouts may need adjusting in Excel." },
      { q: "Can I convert scanned PDFs?", a: "Not at the moment. Scanned PDFs are images and have no text to extract." },
    ],
  },
  "excel-to-pdf": {
    title: "Excel to PDF Converter Free: XLSX to PDF",
    description:
      "Convert Excel spreadsheets (.xlsx) to PDF online for free. Upload your file and download a PDF to share or print.",
    h1: "Convert Excel to PDF",
    intro:
      "Turn a spreadsheet into a PDF that's easy to share and print. Upload your .xlsx file and PaperLess creates a PDF you can open on any device.",
    how: "How to convert Excel to PDF",
    steps: [
      "Add your .xlsx file.",
      "Select the convert button.",
      "Download the PDF.",
    ],
    points: [
      "Supports .xlsx files.",
      "Very wide sheets may split across pages, so check the result.",
    ],
    faqs: [
      { q: "Does it support old .xls files?", a: "Only .xlsx. Open an older .xls file in Excel and save it as .xlsx first." },
      { q: "Will wide spreadsheets fit on the page?", a: "Very wide sheets may continue onto extra pages. Check the PDF afterwards and adjust the sheet's page setup if needed." },
    ],
  },
  "powerpoint-to-pdf": {
    title: "PowerPoint to PDF Converter Free: PPTX to PDF",
    description:
      "Convert PowerPoint presentations (.pptx) to PDF online for free. Upload your slides and download a PDF to share or print.",
    h1: "Convert PowerPoint to PDF",
    intro:
      "Turn a presentation into a PDF that anyone can open. Upload your .pptx file and PaperLess creates a PDF with your slides.",
    how: "How to convert PowerPoint to PDF",
    steps: [
      "Add your .pptx file.",
      "Select the convert button.",
      "Download the PDF.",
    ],
    points: [
      "Supports .pptx files.",
      "A PDF is static, so animations and transitions aren't included.",
    ],
    faqs: [
      { q: "Does it support old .ppt files?", a: "Only .pptx. Open an older .ppt file in PowerPoint and save it as .pptx first." },
      { q: "Are animations kept?", a: "No. A PDF is static, so animations and transitions aren't included. Each slide appears as a page." },
    ],
  },
}

/** Answers every tool page shares, appended after the tool's own FAQs. */
export const COMMON_FAQS = [
  { q: "Is PaperLess free to use?", a: "Yes. All tools are free and you don't need an account." },
  {
    q: "Are my files safe?",
    a: `Files are uploaded over an encrypted connection, used only to produce your result, and deleted automatically after about ${RETENTION_LABEL}. See the Privacy Policy for details.`,
  },
]

export const HOME_FAQS = [
  {
    q: "What is PaperLess?",
    a: "PaperLess is a free collection of online PDF tools. You can merge, split, rotate, reorder, compress, watermark, number, protect and unlock PDFs, convert PDFs to Word, Excel and images, and turn Word, Excel, PowerPoint and images into PDFs.",
  },
  { q: "Do I need to create an account?", a: "No. Every tool works without signing up. Pick a tool, add your file and download the result." },
  {
    q: "Are my files private?",
    a: `Files are uploaded over an encrypted connection, used only to produce your result, and deleted automatically after about ${RETENTION_LABEL}. We don't read, sell or share them.`,
  },
  { q: "Does it work on my phone?", a: "Yes. PaperLess runs in any modern browser on phones, tablets and computers, and there is nothing to install." },
  { q: "Is there a file size limit?", a: `Each file can be up to ${MAX_FILE_MB} MB.` },
]
