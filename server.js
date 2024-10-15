require("dotenv").config();
const cors = require("cors");
const express = require("express");
const formidable = require("formidable-serverless"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const app = express();
const PORT = 5000;
console.log("inside server.js");
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

app.post("/api/ask", (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing the form:", err);
      return res.status(500).json({ message: "Form parsing failed." });
    }

    const { question } = fields;
    const file = files.file;

    if (!file || !question) {
      return res
        .status(400)
        .json({ message: "File and question are required." });
    }

    try {
      const uploadResponse = await fileManager.uploadFile(file.path, {
        mimeType: file.type,
        displayName: file.name,
      });

      console.log(
        `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
      );

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        { text: question },
      ]);

      const answer = result.response.text();
      res.json({ answer });
      console.log("Answer: ", answer);
    } catch (error) {
        console.error("Error details:", error.message || error);
        if (error.message === "Unsupported file type.") {
          res.send({answer: error.message});
        } else {
          res.send({answer: "An error occurred or file type is not supported"});
        }
      }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
