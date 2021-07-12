//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aryaputra:arya123@cluster0.y6r5z.mongodb.net/todolistDB", { useNewUrlParser: true,  useUnifiedTopology: true })

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome To Your Todolist"
});

const item2 = new Item({
  name: "Hit the + button to add a new Item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, items){

    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully added to database");
        }
      });
    }
      res.render("list", {listTitle: "Today", newListItems: items});
  })
});

app.get("/:customURL", function(req,res){
  const urlName = _.capitalize(req.params.customURL);
  List.findOne({name:urlName}, function(err, founded){
    if (!err) {
      if (!founded) {
        const list = new List({
          name: urlName,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + urlName);
      } else {
        res.render("list", {listTitle: founded.name, newListItems: founded.items});
      }
    }
  })
});

app.post("/", function(req, res){
  const item = req.body.newItem;
  const listTitle = req.body.list;
  const newItem = new Item({
    name: item
  });

  if (listTitle === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    console.log("MSUK");
    List.findOne({name:listTitle}, function(err,founded){
      founded.items.push(newItem);
      founded.save();
      res.redirect("/"+listTitle);
    });
  }
});

app.post("/delete", function(req,res){
  const choosenItem = req.body.chooseItem;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({name:choosenItem}, function(err){
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listName}, {$pull: {items:{name:choosenItem}}}, function(err){
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    })
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
