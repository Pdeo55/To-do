const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("server is up and running on port",port);
});

const DATABASE_URL =
  "mongodb+srv://Work:Work0987@cluster0.c2p2qtq.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Models
const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

//API
const day = date.day();
app.post("/", function (req, res) {
  const listname = req.body.list;
  const item = new Item({
    name: req.body.work,
  });

  if (listname === day) {
    item.save();
  } else {
    List.findOne({ name: listname }, function (err, foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listname);
    });
  }
});

app.post("/delete", function (req, res) {
  const itemCheckedId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(itemCheckedId, function (err) {
      if (!err) {
        console.log("successfully deleted Checked Item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemCheckedId } } },
      function (err, foundlist) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/", function (req, res) {
  Item.find({}, function (err, founditems) {
    res.render("list", { Listday: day, newWorkItem: founditems });
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //new list created
        const list = new List({
          name: customListName,
          items: req.body.work,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          Listday: foundList.name,
          newWorkItem: foundList.items,
        });
      }
    }
  });
});
