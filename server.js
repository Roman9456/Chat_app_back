import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = createServer(app);
const wsServer = new WebSocketServer({ server });

app.use(cors());
app.use(
  bodyParser.json({
    type() {
      return true;
    },
  })
);

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

const userState = [];

const userRouter = express.Router();

userRouter.post("/new-user", async (request, response) => {
  const { name } = request.body;

  if (!name) {
    return response.status(400).json({
      status: "error",
      message: "Name is required",
    });
  }

  const isExist = userState.find((user) => user.name === name);
  if (isExist) {
    return response.status(409).json({
      status: "error",
      message: "This name is already taken!",
    });
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
  };
  userState.push(newUser);

  return response.json({
    status: "ok",
    user: newUser,
  });
});

app.use("/users", userRouter);

wsServer.on("connection", (ws) => {
  ws.on("message", (msg, isBinary) => {
    const receivedMSG = JSON.parse(msg);
    console.dir(receivedMSG);

    switch (receivedMSG.type) {
      case "exit":
        {
          const idx = userState.findIndex(
            (user) => user.name === receivedMSG.user.name
          );
          userState.splice(idx, 1);
          broadcastUserState();
        }
        break;
      case "send":
        {
          broadcastMessage(msg, isBinary);
        }
        break;
      default:
        break;
    }
  });

  broadcastUserState();
});

function broadcastUserState() {
  [...wsServer.clients]
    .filter((o) => o.readyState === WebSocket.OPEN)
    .forEach((o) => o.send(JSON.stringify(userState)));
}

function broadcastMessage(msg, isBinary) {
  [...wsServer.clients]
    .filter((o) => o.readyState === WebSocket.OPEN)
    .forEach((o) => o.send(msg, { binary: isBinary }));
}

const port = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    server.listen(port, () =>
      console.log(`Server has been started on http://localhost:${port}`)
    );
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
