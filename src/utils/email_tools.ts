export function getCertificationContents(cert_number: number, link: string) {
  const contents = `<div style='width: 500px; height: 150px; 
  display: flex; flex-direction: column; align-items: center;
   justify-content: space-around; margin: 0 auto'
   >
    <h2 style='text-align: center'>[어디어디]입니다.<br/>아래 링크로 접속하여 인증번호를 입력해주세요.</h2>
    <p style='text-align: center; font-size: 1.15rem'>인증번호는 <b>${cert_number}</b>입니다.<br/>링크 : <a href='${link}' target='_blank'>${link}</a></p>
  </div>`

  return contents;
}