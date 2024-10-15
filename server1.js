require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

// Initialize GoogleGenerativeAI and GoogleAIFileManager with your API_KEY
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();

// Set up multer to handle multiple file types (audio, image, document, code, text)
// const upload = multer({
//     dest: 'uploads/',
//     fileFilter: (req, file, cb) => {
//         // console.log("Detected MIME type: ", req.file.mimetype);

//       const fileTypes = /pdf|jpeg|jpg|png|webp|heic|heif|wav|mp3|aiff|aac|ogg|flac|x-javascript|javascript|x-python|python|txt|html|css|md|csv|xml|rtf/;
//       const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//       const mimetype = fileTypes.test(file.mimetype);

//       if (mimetype && extname) {
//         return cb(null, true);
//       } else {
//         cb(new Error('Unsupported file type.'));
//       }
//     }
//   });

const upload = multer({
  dest: "uploads/", // Upload destination folder
});

// Enable CORS for all routes
app.use(cors());

// Enable JSON parsing
app.use(express.json());

// Endpoint to handle both PDF and image uploads and questions
app.post("/api/ask", upload.single("file"), async (req, res) => {
  try {
    console.log("req--: ",req.body);
    // const filePath = req.file.path;
    // const fileType = req.file.mimetype;
    // const question = req.body.question;

    // console.log("File path: ", filePath);
    // console.log("File type: ", fileType);
    // console.log("Question: ", question);

    // let mimeType;
    // switch (fileType) {
    //   case "application/pdf":
    //   case "image/jpeg":
    //   case "image/png":
    //   case "image/webp":
    //   case "image/heic":
    //   case "image/heif":
    //   case "audio/wav":
    //   case "audio/mp3":
    //   case "audio/aiff":
    //   case "audio/aac":
    //   case "audio/ogg":
    //   case "audio/flac":
    //   case "application/x-javascript":
    //   case "text/javascript":
    //   case "application/x-python":
    //   case "text/x-python":
    //   case "text/plain":
    //   case "text/html":
    //   case "text/css":
    //   case "text/md":
    //   case "text/csv":
    //   case "text/xml":
    //   case "text/rtf":
    //     mimeType = fileType; // Use the file's original mimetype
    //     break;
    //   default:
    //     throw new Error("Unsupported file type.");
    // }

    // // Upload the file to Google AI for use
    // const uploadResponse = await fileManager.uploadFile(filePath, {
    //   mimeType: mimeType,
    //   displayName: req.file.originalname,
    // });

    // console.log(
    //   `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    // );

    // console.log(
    //   "uploaded response: ",
    //   uploadResponse.file.mimeType,
    //   " ",
    //   uploadResponse.file.uri
    // );
    // // Call Google Generative AI to generate content using the uploaded file as context
    // const result = await model.generateContent([
    //   {
    //     fileData: {
    //       mimeType: uploadResponse.file.mimeType,
    //       fileUri: uploadResponse.file.uri,
    //     },
    //   },
    //   { text: question }, // Add the user's question here
    // ]);

    // const answer = result.response.text();
    // res.json({ answer });
    // console.log("Answer: ", answer);

    // // Clean up the uploaded file after processing
    // fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error details:", error.message || error);
    if (error.message === "Unsupported file type.") {
      res.send({answer: error.message});
    } else {
      res.status(500).send("An error occurred while processing your request.");
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
