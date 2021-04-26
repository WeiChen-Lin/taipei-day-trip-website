# The program that move json into databases
import sys , json , re
sys.path.append("./data")

from SQLoperation import MySQLCon
from dotenv import dotenv_values

config = dotenv_values(".env")

config["port"] = int(config["port"])

#資料庫參數設置


sqlObject = MySQLCon(config)

with open("data/taipei-attractions.json" , "r" , encoding="utf8") as f:
    json_file = json.load(f)

data = json_file["result"]["results"]

pattern =  re.compile("(http://.*?)(JPG|jpg|PNG|png)")

for view in data:
    img_id = view["_id"]
    name = view["stitle"]
    category = view["CAT2"]
    description = view["xbody"]
    address = view["address"]
    transport = view["info"]
    MRT = view["MRT"]
    latitude = view["latitude"]
    longitude = view["longitude"]
    img = view["file"]
    sqlObject.tableInsertAtr(img_id, name, category, description, address, transport, MRT, latitude, longitude)
    url_set = pattern.findall(img)
    for url in url_set:
        img_url = url[0] + url[1]
        sqlObject.tableInsertImg(img_id , img_url)



