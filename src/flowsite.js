let i = 0;
let prev = 0;
let hist = [];
let endNotes = [];
let stepNotes = [];
let showPrev = false;
draw(db);

function repPer(inp,arr,key,char){
  let slash = "\\";
  let regex = new RegExp(slash + char + "(?=[^\d])");
  let joinVal = inp;
  if (joinVal[-1]===key) joinVal += " ";
  joinVal = inp.split(regex);
  if (joinVal.length===1){
    return inp;
  }
  if (joinVal[-1]===key) joinVal.splice(-1, 1);
  mappedArr = arr.map(d => d[key]);
  for (let u = 0; u < joinVal.length; u++){
    if (u % 2 === 1){
      joinVal[u] = mappedArr[parseInt(joinVal[u])-1];
    }
  }
  return joinVal.join("");
}

function draw(data, err) {
  let db = data;
  endNotes = [];
  stepNotes = [];
  for (let r = 0; r < db.length; r++){
    if (db[r].type === "note"){
      if (db[r].position === "end"){
        endNotes.push(db[r].contents);
      } else if (db[r].position === "option"){
        stepNotes.push(db[r].contents);
      }
    }
    if (db[r].tier == i) {
      i = r;
      break;
    }
  }
  document.body.innerHTML = "<script src='script.js'></script>";
  if (db[i].type === "finish"){
    i = 0;
    prev = 0;
    hist = [];
    endNotes = [];
    stepNotes = [];
    showPrev = false;
    if (db[i].action){
      db[i].action(hist);
      if (showNotes != false){
        for (var n = 0; n < endNotes.length; n++){
          document.body.innerHTML += endNotes[n];
        }
      }
    } else if (db[i].hasOwnProperty("message")){
      document.body.innerHTML += repPer(repPer(db[i].message, hist, "tier", "%"), hist, "option", "$");
      for (var n = 0; n < endNotes.length; n++){
        document.body.innerHTML += endNotes[n];
      }
    }
  } else {
    document.body.innerHTML += (err ? (err + "<br/>") : ("")) + db[i].question + "<br/>";
    switch (db[i].type) {
      case "dropdown":
        document.body.innerHTML += "<select id='" + i.toString() + "'></select>";
        for (var b = 0; b < db[i].contents.length; b++) {
          document.getElementById(i.toString()).innerHTML += "<option value='" + db[i].contents[b].identifier + "'>" + db[i].contents[b].answer + "</option>";
        }
        break;
      case "number":
        document.body.innerHTML += "<input type='number' id='" + i.toString() + "'></input>";
        break;
      case "text":
        document.body.innerHTML += "<input type='text' id='" + i.toString() + "'></input>";
        break;
    }
    document.body.innerHTML += "<button id='next" + i.toString() + "'>OK</button><br/>"
    for (var n = 0; n < stepNotes.length; n++){
      document.body.innerHTML += stepNotes[n];
    }
    if (showPrev) {
      document.body.innerHTML += "<button id='back" + i.toString() + "'>Back</button>";
      document.getElementById("back" + i.toString()).addEventListener("mouseup", function () {
        i = prev;
        history.splice(-1);
        draw();
      });
    }
    document.getElementById("next" + i.toString()).addEventListener("mouseup", function () {
      showPrev = true;
      let drawn = false;
      db[i].finalVal = document.getElementById(i.toString()).value;
      hist.push({tier: i, option: db[i].finalVal});
      for (a = 0; a < db[i].contents.length; a++) {
        if (db[i].finalVal == db[i].contents[a].identifier) {
          prev = i;
          drawn = true;
          i = db[i].contents[a].goto;
          break;
        }
      }
      draw(drawn ? "" : "Invalid answer");
    });
  }
}
