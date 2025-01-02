const express = require("express");
const cors = require("cors");
const { client } = require("./utils/mongodb");
const { ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(express.json());
app.use(cors());

let isConnected = false;
app.use(async (req, res, next) => {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }
    req.db = client.db("todosCollection");
    next();
  } catch (error) {
    console.log(error);
  }
});

app.get("/", async (req, res) => {
  res.send("Hello MongoDB");
});

app.get("/todos", async (req, res) => {
  try {
    const todos = await req.db.collection("todos").find({}).toArray();
    res.send(todos);
  } catch (error) {
    console.log(error);
  }
});
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const result = await req.db.collection("todos").findOne(query);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
app.post("/todos", async (req, res) => {
  const { title, message } = req.body;

  try {
    const todo = req.db.collection("todos");
    const todoInfo = { title, message };
    const result = await todo.insertOne(todoInfo);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const findDeleteItem = req.db.collection("todos");
    const result = await findDeleteItem.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const { title, message } = req.body;
    const { id } = req.params;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        title,
        message,
      },
    };
    const result = await req.db
      .collection("todos")
      .updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (error) {}
});

app.listen(port, async () => {
  console.log(`Listening Port Running ${port}`);
});
