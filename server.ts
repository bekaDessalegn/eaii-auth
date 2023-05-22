import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { gql } from "graphql-request";
import { client } from "./client";
import { generateJWT } from "./jwt";
import { upload } from './cloudinary';
import fileUpload, { UploadedFile } from 'express-fileupload';


require('dotenv').config()

const app = express();
const port = process.env.PORT || 3004;

// Parse JSON in request bodies
app.use(express.json());

app.use(
    fileUpload({
      useTempFiles: true,
    })
  );

app.post("/auth/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body.input as Record<string, string>;

  // @ts-ignore
  let { admin } = await client.request(
    gql`
      query getAdminByEmail($email: String!) {
        admin(where: { email: { _eq: $email } }) {
          id
          password
        }
      }
    `,
    {
      email,
    }
  );

  if (admin.length > 0) {
    res.send({
      "message": "Admin already exists"
    })
    return;
  }

  // In production app, you would check if user is already registered
  // We skip that in this tutorial for the sake of time

  // We insert the user using a mutation
  // Note that we salt and hash the password using bcrypt

  interface InsertUserResponse {
    insert_admin_one: {
      id: string;
    };
  }

  const response = await client.request<InsertUserResponse>(
    gql`
      mutation registerUser($admin: admin_insert_input!) {
        insert_admin_one(object: $admin) {
          id
        }
      }
    `,
    {
      admin: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
      },
    }
  );

  const { id: adminId } = response.insert_admin_one;

  res.send({
    token: generateJWT({
      defaultRole: "eaii-admin",
      allowedRoles: ["eaii-admin"],
      otherClaims: {
        "X-Hasura-User-Id": adminId,
      },
    }),
  });
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body.input as Record<string, string>;

  // @ts-ignore
  let { admin } = await client.request(
    gql`
      query getAdminByEmail($email: String!) {
        admin(where: { email: { _eq: $email } }) {
          id
          password
        }
      }
    `,
    {
      email,
    }
  );

  // Since we filtered on a non-primary key we got an array back
  admin = admin[0];

  if (!admin) {
    res.sendStatus(401);
    return;
  }

  // Check if password matches the hashed version
  const passwordMatch = await bcrypt.compare(password, admin.password);

  if (passwordMatch) {
    res.send({
      token: generateJWT({
        defaultRole: "eaii-admin",
        allowedRoles: ["eaii-admin"],
        otherClaims: {
          "X-Hasura-User-Id": admin.id,
        },
      }),
    });
  } else {
    res.sendStatus(401);
  }
});

app.post('/uploadImage', async (req, res) => {
    if (!req.files) return res.send('Please upload an image');
  
    const { image } = req.files as Record<string, UploadedFile>;
    const cloudFile = await upload(image);
    console.log(cloudFile);
  
    res.status(201).json({
      message: 'Image uploaded successfully',
      imageUrl: cloudFile.url,
    });
  });


app.listen(port, () => {
  console.log(`Auth server running on port ${port}.`);
});
