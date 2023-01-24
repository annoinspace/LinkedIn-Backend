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
        text: "Current job" + data.job ? data.job : "No current job.",
        alignment: "center",
      },
      {
        image: "main",
        width: 150,
        alignment: "center",
        margin: [0, 10, 0, 10],
      },
      { text: "Experiences:", fontSize: 15, margin: [0, 10, 0, 10] },
      {
        ul: [
          data.experiences?.map(function (experience, index) {
            return {
              ul: [
                experience.role +
                  " in " +
                  experience.company +
                  "." +
                  "\n" +
                  "Description: " +
                  experience.description +
                  "\n" +
                  "Area: " +
                  experience.area,
              ],
              margin: [0, 3, 0, 3],
            };
          }),
        ],

        lineHeight: 2,
      },

      {
        text:
          "Interests" + data.interests.length > 0
            ? data.interests
            : "No interests has been added yet.",
        margin: [0, 30, 0, 10],
      },
      {
        text:
          "Education" + data.interests.length > 0
            ? data.interests
            : "No education has been added yet.",
        margin: [0, 10, 0, 10],
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
