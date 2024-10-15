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

const upload = multer({
    dest: 'uploads/' // Upload destination folder
  });
  

// Enable CORS for all routes
app.use(cors());

// Enable JSON parsing
app.use(express.json());

app.post('/api/ask', async (req, res) => {
  try {
    console.log("req.body", req.body);

    const { fileData, fileName, fileType, question } = req.body;

    if (!fileData || !fileName || !fileType || !question) {
      return res.status(400).json({ message: "All fields are required." });
    }

    console.log("File name: ", fileName);
    console.log("File type: ", fileType);
    console.log("Question: ", question);
    

    const uploadResult = await fileManager.uploadFile(
        `${mediaPath}/samplesmall.mp3`,
        {
          mimeType: "audio/mp3",
          displayName: "Audio sample",
        },
      );
      
      let file = await fileManager.getFile(uploadResult.file.name);
      while (file.state === FileState.PROCESSING) {
        process.stdout.write(".");
        // Sleep for 10 seconds
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        // Fetch the file from the API again
        file = await fileManager.getFile(uploadResult.file.name);
      }
      
      if (file.state === FileState.FAILED) {
        throw new Error("Audio processing failed.");
      }

    console.log(
      `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    );

    console.log("uploaded response: ", uploadResponse.file.mimeType," ", uploadResponse.file.uri);
    // Call Google Generative AI to generate content using the uploaded file as context
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: question }, // Add the user's question here
    ]);

    const answer = result.response.text();
    res.json({ answer });
    console.log("Answer: ", answer);

    // Clean up the uploaded file after processing
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error details:", error.message || error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
