//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-taka:test123@cluster0-otqhb.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemScheme = {
  name: String
};

const Item = mongoose.model("Item", itemScheme);


const Item1 = new Item({
  name: "Welcome to your todolist!"
});
const Item2 = new Item({
  name: "Hit + button to add a new item"
});
const Item3 = new Item({
  name: "<-- Hits this to delete an item"
});

const defaultItem = [Item1, Item2, Item3];

const listScheme ={
  name:String,
  items: [itemScheme]
};

const List = mongoose.model("List",listScheme);

app.get("/", function(req, res) {

  Item.find(function(err, results) {
    if (results.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully added Item!!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItem
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

    items = new Item({
      name: itemName
    });

    if(listName === "Today"){
      items.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName},function(err, foundList){
        foundList.items.push(items);
        foundList.save();
        res.redirect("/" + listName);
      });
    }

});

app.post("/delete", function(req, res) {
const itemDelete = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  Item.deleteOne({
    _id: itemDelete
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Succes Delete!");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: itemDelete}}},function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}



});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
