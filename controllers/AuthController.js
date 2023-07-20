import getPrismaInstance from "../utils/PrismaClient.js";
import { generateToken04 } from "../utils/TokenGenerator.js";
export const checkUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ msg: "Email is required", status: false });
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.json({ msg: "User not found", status: false });
    } else {
      return res.json({ msg: "User found", status: true, data: user });
    }
  } catch (error) {
    next(error);
  }
};

export const onBoardUser = async (req, res, next) => {
  try {
    const { email, name, about, image: profilePicture } = req.body;

    if (!email || !name || !profilePicture) {
      return res.json({ msg: "These fields are required", status: false });
    }
    const prisma = getPrismaInstance();
    await prisma.user.create({
      data: {
        email,
        name,
        about,
        profilePicture,
      },
    });
    return res.json({ msg: "User created", status: true });
  } catch (error) {}
};

export const getUser = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const user = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        profilePicture: true,
      },
    });
    const usersGroupedByInitialLetter = {};
    user.forEach((user) => {
      const initialLetter = user.name.charAt(0).toUpperCase();
      if (!usersGroupedByInitialLetter[initialLetter]) {
        usersGroupedByInitialLetter[initialLetter] = [];
      }
      usersGroupedByInitialLetter[initialLetter].push(user);
    });

    return res.status(200).send({
      msg: "User found",
      status: true,
      user: usersGroupedByInitialLetter,
    });
  } catch (error) {
    next(error);
  }
};

export const generateToken = (req, res, next) => {
  try {
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_ID;
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";
    if (userId && appId && serverSecret) {
      const token = generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );

      return res.status(200).json({ token });
    }
    return res
      .status(400)
      .send("user id, app id and server secret are required");
  } catch (error) {
    next(error);
  }
};
