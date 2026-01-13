import { google } from "googleapis";
import fs from "fs";
import path from "path";

const CREDENTIAL_PATH = path.join("patrol.report.credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIAL_PATH,
  scopes: SCOPES,
});

export const uploadToDrive = async (req, res) => {
  const file = req.body;
  try {
    const data = await google
      .drive({ version: "v3", auth: auth })
      .files.create({
        media: {
          mimeType: file.mimeType,
          body: fs.createReadStream(file.path),
        },
        requestBody: {
          name: file.originalname,
          parents: ["1e98vZugtTswuNjf-z1-q_sLTQxi7htVc"],
        },
        fields: "id,name",
      });
    if (!data) {
      res.status(400).json({ success: false, message: "Error upload file" });
    }
    res.status(200).json({
      success: true,
      message: "Success upload file",
      file_id: data.id,
      file_name: data.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
