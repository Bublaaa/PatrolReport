import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();
//* OAUTH
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URL = process.env.REDIRECT_URL;
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = google.drive({ version: "v3", auth: oAuth2Client });

// ** CREATE
export const uploadToDrive = async (file) => {
  try {
    if (!file) {
      throw new Error("File not found");
    }
    const response = await drive.files.create({
      requestBody: {
        name: file.originalName,
        parents: ["1e98vZugtTswuNjf-z1-q_sLTQxi7htVc"],
      },
      media: {
        mimeType: file.mimeType,
        body: fs.createReadStream(file.path),
      },
      fields: "id, name, webContentLink, webViewLink",
    });
    return {
      fileId: response.data.id,
      fileName: response.data.name,
      viewLink: response.data.webViewLink,
    };
  } catch (error) {
    throw new Error(`Drive upload failed: ${error.message}`);
  }
};

export const uploadToDriveWithMulter = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(404).json({ success: false, message: "File not found" });
    }
    const response = await drive.files.create({
      requestBody: {
        name: file.originalName,
        parents: ["1e98vZugtTswuNjf-z1-q_sLTQxi7htVc"],
      },
      media: {
        mimeType: file.mimeType,
        body: fs.createReadStream(file.path),
      },
      fields: "id, name, webContentLink, webViewLink",
    });
    res.status(200).json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      downloadLink: response.data.webContentLink,
      viewLink: response.data.webViewLink,
      message: "Success upload file",
    });
    return {
      fileId: response.data.id,
      fileName: response.data.name,
      viewLink: response.data.webViewLink,
    };
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// **  DELETE
export const deleteFromDrive = async (req, res) => {
  const fileId = req.body;
  if (!fileId) {
    res.status(404).json({ success: false, message: "File id not found" });
  }
  try {
    const response = await drive.files.delete({ fileId: fileId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// * SERVICE ACCOUNT
// const CREDENTIAL_PATH = path.join(
//   process.cwd(),
//   "patrol.report.credentials.json"
// );
// const SCOPES = ["https://www.googleapis.com/auth/drive"];

// const auth = new google.auth.GoogleAuth({
//   keyFile: CREDENTIAL_PATH,
//   scopes: SCOPES,
// });

// export const upload = async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) {
//       res.status(404).json({ success: false, message: "File not Found" });
//     }
//     const authClient = await auth.getClient();

//     const drive = google.drive({
//       version: "v3",
//       auth: authClient,
//     });
//     const response = await drive.files.create({
//       requestBody: {
//         name: file.originalname,
//         parents: ["1e98vZugtTswuNjf-z1-q_sLTQxi7htVc"],
//       },
//       media: {
//         mimeType: file.mimetype,
//         body: fs.createReadStream(file.path),
//       },
//       fields: "id, name",
//     });
//     fs.unlinkSync(file.path);

//     res.status(200).json({
//       success: true,
//       fileId: response.data.id,
//       fileName: response.data.name,
//       // driveUrl: response.data.webViewLink,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
