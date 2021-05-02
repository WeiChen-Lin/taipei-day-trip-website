from flask import *

import sys , json
sys.path.append("./data")

from SQLoperation import MySQLCon
from dotenv import dotenv_values

config = dotenv_values(".env")

config["port"] = int(config["port"])


sqlObject = MySQLCon(config)
app=Flask(__name__)


app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

# Pages
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")

@app.route("/booking")
def booking():
    return render_template("booking.html")

@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")

@app.route("/api/attractions")
def AttrwithKey():
    page = int(request.args.get("page"))
    keyword = request.args.get("keyword")
    
    if keyword == None:
        keyword = ""
	
    to_json = sqlObject.getAttraction_withPage(page , keyword)

    return(json.dumps(to_json , ensure_ascii=False))

@app.route("/api/attraction/<id>")
def AttrwithId(id):
	
    return json.dumps(sqlObject.fromIdSearchAttr(id) , ensure_ascii=False )
	

app.run(port=3000 , debug=True)

