import PdfPrinter from "pdfmake";
import imageToBase64 from "image-to-base64";

const getPDFReadableStream = async (data) => {
  async function createBase64(url) {
    let base64Encoded = await imageToBase64(url);
    return "data:image/jpeg;base64, " + base64Encoded;
  }

  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      {
        text: data.name + " " + data.surname,
        style: "header",
      },
      {
        image: "main",
      },
    ],
    images: {
      main: await createBase64(data.pfp),
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: "center",
      },
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();
  return pdfReadableStream;
};

export default getPDFReadableStream;
