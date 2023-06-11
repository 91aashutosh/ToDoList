const express=require("express");
const bodyParser=require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app=express();
// let items = [];
// let wItems = [];
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://aashu2348154:Aashu123@cluster0.uanyjgk.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items : [itemSchema]
});

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name: "Welcome to your to do list!!"
});
const item2 = new Item({
    name: "Hit + button to add a new item"
});
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});


app.get("/",function(req, res){
    // var today = new Date();

    // var currentDay = today.getDay();
    // var currentDate = today.getDate();
    // var currMonth = today.getMonth()+1;
    // var currYear = today.getFullYear();
    // var wDay=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // var options ={
    // }
    Item.find().then(function(it){

        if(it.length === 0)
        {
            Item.insertMany([item1, item2, item3]).then(function(){
                console.log("Successfully added items to collection");
            }).catch(function(err){
                console.log(err);
            });

            res.redirect("/");
        }

        else
        {
            console.log(it);
            res.render("list",{
            // day : wDay[currentDay],
            // date : currentDate,
            // month : currMonth,
            // year : currYear,
            items : it,
            listType : "Initial"
            });
        }
    }).catch(function(err){
        console.log(err);
    });
});

// app.get("/work", function(req,res){
//     res.render("work",{
//         wItems : wItems
//     });
// })

// app.post("/work",function(req,res){
//     console.log(req.body);
//     let item=req.body.newItem;
//     wItems.push(item);
//     res.redirect("/work");
// })

app.get("/:customListName",function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.find({name: customListName}).then(function(li)
    {
        if(li.length == 0)
        {
            const list = new List({
                name: customListName,
                items: [item1, item2, item3]
            });
            console.log("inserted default items to list");
            list.save();
        }
        else
        {
            console.log("Can't Add, List Already exists");
        }

        if(li.length == 0)
        {
            res.redirect("/"+customListName);
        }

        res.render("list",{
            listType : customListName,
            items : li[0].items
        });

    }).catch(function(err){
        console.log(err);
    });
});

app.post("/",function(req,res){
    let item=req.body.item;
    let listName= _.capitalize(req.body.listAddBtn);

    const newItem = new Item({
        name: item
    });

    if(listName === "Initial")
    {
        newItem.save();
        // items.push(item);
        res.redirect("/");
    }
    else
    {
        List.find({name: listName}).then(function(li){
            li[0].items.push(newItem);
            li[0].save();
            console.log(li);
        }).catch(function(err){
            console.log(err);
        });
        res.redirect("/"+listName);
    }

});

app.post("/delete/:customListName", function(req, res){
    console.log(req.body.checkbox);
    let listName = _.capitalize(req.params.customListName);
    let checkedItem = req.body.checkbox;

    if(listName === "Initial")
    {
        Item.deleteOne({_id : checkedItem}).then(function(){
            console.log("Successfully Deleted");
        }).catch(function(err){
            console.log(err);
        });
        res.redirect("/");
    }
    else
    {
        List.findOneAndUpdate({name: listName}, {$pull : {items : {_id: checkedItem}}}).then(function(){
            console.log("deleted Successfully");
            res.redirect("/"+listName);
        }).catch(function(err){
            console.log(err);
        });
    }
});

app.listen(3000,function(){
    console.log("server is running on port 3000");
});
