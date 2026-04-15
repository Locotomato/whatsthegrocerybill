export default function AfsUnit() {
  const scriptHtml = `<script src="https://locotomato.com/afs.js" data-partner="pub_rs2wayi1" data-campaign="cmp_db18b9c4" data-count="6" async></script>`
  return (
    <div
      style={{ margin: '32px 0' }}
      dangerouslySetInnerHTML={{ __html: scriptHtml }}
    />
  )
}
