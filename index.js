const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const env = require("dotenv");
env.config();
const app = express();
const port = process.env.PORT_NO;

const dbUsername = process.env.USER_NAME;
const dbPassword = process.env.PASSWORD;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.lbhte.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("coffeeShopDB");
    const collection = database.collection("coffeeCollection");

    app.get("/all-coffee", async (req, res) => {
      const cursor = collection.find();
      const result = await cursor.toArray();
      if (result.length > 0) {
        res.json({
          message: "Data loaded successfully",
          body: result,
        });
      } else {
        res.json({
          message: "Something Wrong",
        });
      }
    });
    app.get('/all-coffee/:id', async (req, res) => {
        const findSingleCoffeeInfoId = req.params.id
        const query = {id : findSingleCoffeeInfoId}
        const result = await collection.findOne(query)

        res.send(result)
    })
    app.post("/all-coffee", async (req, res) => {
      const newCoffeeInfo = req.body;
      const result = await collection.insertOne(newCoffeeInfo);
      if (result.acknowledged) {
        res.json({
          message: "New Coffee Added Successfully",
          body: newCoffeeInfo,
        });
      } else {
        res.json({
          message: "Something Wrong",
        });
      }
    });

    app.put("/admin/all-coffee/update/:id", async (req,res) => {
        const updateCoffeeId = req.params.id
        const filter = {id: updateCoffeeId}
        const updateCoffee= req.body
        console.log(updateCoffee.image)
        const options = {upsert: true}
        const updateCoffeeData = {
          $set: {
            name: updateCoffee.name,
            supplier: updateCoffee.supplier,
            category: updateCoffee.category,
            chef: updateCoffee.chef,
            test: updateCoffee.test,
            details: updateCoffee.details,
            image: updateCoffee.image,
            price: updateCoffee.price,
          },
        };
        const result = await collection.updateOne(filter, updateCoffeeData ,options)

        if(result.acknowledged){
            res.json({
                message:"Information Update Successfully"
            })
        }else{
            res.json({
                message:"Something Wrong"
            })
        }
    })

    app.delete('/admin/all-coffee/:id', async(req, res) => {
        const deleteId = req.params.id
        const query = {id: deleteId}

        const result = await collection.deleteOne(query)
        if (result.acknowledged) {
          res.json({
            message: "Item Deleted Successfully",
          });
        } else {
          res.json({
            message: "Something Wrong",
          });
        }
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.log(err);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Hello!! I am from backend");
});

app.listen(port, () => {
  console.log("Project listen on port no", port);
});
