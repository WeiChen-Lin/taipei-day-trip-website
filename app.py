from flask import *
import sys , json, jwt, datetime, time
sys.path.append("./data")

from GetTapPay import *
from SQLoperation import MySQLCon, User_MySQLCon, Booking_SQL, Order_SQL, RDS_SQL
from s3DataStorage import uploadFile
from dotenv import dotenv_values

config = dotenv_values(".env")

sqlConfig = {
    "host" : config["host"],
    "port" : int(config["port"]),
    "user" : config["user"],
    "password" : config["password"],
    "db" : config["db"],
    "charset" : config["charset"]
}
s3Config = {
    "aws_access_key_id":config["aws_access_key_id"],
    "aws_secret_access_key":config["aws_secret_access_key"]
}
RDSConfig = {
    "host" : config["rds_host"],
    "user" : config["rds_user"],
    "password" : config["password"],
    "db" : config["rds_db"],
}
partner_key = config["partner_key"]

sqlObject = MySQLCon(sqlConfig)
UsersqlObject = User_MySQLCon(sqlConfig)
bookingsqlObject = Booking_SQL(sqlConfig)
ordersqlObject = Order_SQL(sqlConfig)
s3Object = uploadFile(s3Config)
RDSObject = RDS_SQL(RDSConfig)
app=Flask(__name__) 

app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["SECRET_KEY"] = config["secret_key"]


# Pages
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
    
    return render_template("attraction.html" , id = id)

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

@app.route("/api/user" , methods=["POST", "PATCH", "GET", "DELETE"])
def User():
    #登入方面
    if request.method == 'PATCH':
        
        data = request.get_json()

        if (data["email"] != "") & (data["password"] != ""):
            
            email = data["email"]
            password = data["password"]

            email_check , password_check = UsersqlObject.SignInUserCheck(email , password)
            
            print(email_check , password_check)

            if (email_check[0] == 1):

                if password_check:

                    if password == password_check[0]: 

                        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)

                        response = make_response( jsonify({"ok":True}) , 200)

                        token  = jwt.encode( {"email":email , "exp": expire} , app.config["SECRET_KEY"])
                        
                        response.set_cookie(key="token" , value=token , expires=expire)

                        response.headers["Content-Type"] = "application/json"
                        
                        return response
                    
                    else:
                        response = make_response( jsonify({"error":True , "message":"帳號或密碼錯誤請重新輸入"}) , 400)
                
                        response.headers["Content-Type"] = "application/json"
                        
                        return response
                
                else:
                    response = make_response( jsonify({"error":True , "message":"帳號或密碼錯誤請重新輸入"}) , 400)
                
                    response.headers["Content-Type"] = "application/json"
                    
                    return response

            elif (email_check != 1) or (password_check != password) :
                
                response = make_response( jsonify({"error":True , "message":"帳號或密碼錯誤請重新輸入"}) , 400)
                
                response.headers["Content-Type"] = "application/json"
                
                return response
            
            else:

                response = make_response( jsonify({"error":True , "message":"伺服器錯誤"}) , 500)
                
                response.headers["Content-Type"] = "application/json"
                
                return response
    
        else:
            
                response = make_response( jsonify({"error":True , "message":"請輸入帳號及密碼"}) , 500)
                
                response.headers["Content-Type"] = "application/json"
                
                return response

    #註冊方面
    elif request.method == "POST":

        data = request.get_json()

        email = data["email"]
        password = data["password"]
        username = data["username"]

        if (email == "") or (password == "") or (username ==""):
            response = make_response( jsonify({"error":True, "message": "每個欄位皆須填寫"}) , 400)    
            response.headers["Content-Type"] = "application/json"
            return response

        else:

            username_check , email_check = UsersqlObject.SignUpUserCheck(username , email)

            if (username_check[0] == 0) & (email_check[0] == 0):
                
                #使用者資料新增進資料庫
                UsersqlObject.tableInsertUser(email, password, username)

                response = make_response( jsonify({"ok":True}) , 200)
                
                response.headers["Content-Type"] = "application/json"
                
                return response

            elif (email_check[0] != 0):

                response = make_response( jsonify({"error":True , "message":"Email已有人使用"}) , 400)
                
                response.headers["Content-Type"] = "application/json"
                
                return response            
            
            elif (username_check[0] != 0):

                response = make_response( jsonify({"error":True , "message":"使用者名稱已有人使用"}) , 400)
                
                response.headers["Content-Type"] = "application/json"
                
                return response   

            else:

                response = make_response( jsonify({"error":True , "message":"伺服器內部錯誤"}) , 500)
                
                response.headers["Content-Type"] = "application/json"
                
                return response 

    #登入取得使用者cookcie -> 不用重複登入
    elif request.method == "GET":

        cookie = request.cookies.get("token")
        
        if not cookie:
            
            response = make_response( jsonify({"data":None}) , 200)
                
            response.headers["Content-Type"] = "application/json"
            
            return response

        data = jwt.decode(cookie, app.config["SECRET_KEY"] , algorithms=['HS256'])
        
        userinfo = {"id":UsersqlObject.getUserInfor(data["email"])[0], "email":UsersqlObject.getUserInfor(data["email"])[1], "name":UsersqlObject.getUserInfor(data["email"])[2] }
        
        response = make_response( jsonify({"data":userinfo}) , 200)
        
        response.headers["Content-Type"] = "application/json"
        
        return response

    #登出方面(刪除連線)
    elif request.method == "DELETE":

        response = make_response( jsonify({"ok":True}) , 200)

        response.set_cookie(key="token" , value="" , expires=0)

        response.headers["Content-Type"] = "application/json"
        
        return response

    #最後錯誤連線方法
    else:
        return {"error":"Invalid Connection"} , 500      

@app.route("/api/booking", methods=["POST", "GET", "DELETE"] )
def OperBooking():
    
    #建立新行程
    if request.method == 'POST':

        cookie = request.cookies.get("token")
        
        if not cookie:
            
            response = make_response( jsonify({"error":True, "message":"未登入系統"}) , 403)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
        
        userinfo = jwt.decode(cookie, app.config["SECRET_KEY"] , algorithms=['HS256'])
        userID = UsersqlObject.getUserInfor(userinfo["email"])[0]
        data = request.get_json()

        attractionID = int(data["attractionId"])
        date = data["date"]
        time = data["time"]
        price = data["price"]
        time_check = ["Morning" , "Afternoon"]
        price_check = [2000 , 2500]

        if ( attractionID not in range(320) ) or ( time not in time_check ) or (price not in price_check):

            response = make_response( jsonify({"error":True, "message":"格式不符合預期"}) , 400) 

            response.headers["Content-Type"] = "application/json"

            return response

        bookingsqlObject.tableInsertBooking(userID, attractionID, date, time, price)

        response = make_response( jsonify({"ok":True}) , 200)         
        
        response.headers["Content-Type"] = "application/json"
        
        return response

    #根據使用者ID查詢行程訊息
    elif request.method == "GET":
        
        cookie = request.cookies.get("token")
        
        if not cookie:

            response = make_response( jsonify({"error":True, "message":"未登入系統"}) , 403)
                
            response.headers["Content-Type"] = "application/json"
            
            return response

        userinfo = jwt.decode(cookie, app.config["SECRET_KEY"] , algorithms=['HS256'])
        
        userID = UsersqlObject.getUserInfor(userinfo["email"])[0]
        
        booking_info = bookingsqlObject.getBooking(userID)

        response = make_response( jsonify(booking_info) , 200)
                
        response.headers["Content-Type"] = "application/json"
        
        return response

    #使用者刪除行程
    elif request.method == "DELETE":

        cookie = request.cookies.get("token")
        
        if not cookie:

            response = make_response( jsonify({"error":True, "message":"未登入系統"}) , 403)
                
            response.headers["Content-Type"] = "application/json"
            
            return response

        userinfo = jwt.decode(cookie, app.config["SECRET_KEY"] , algorithms=['HS256'])
        
        user_id = UsersqlObject.getUserInfor(userinfo["email"])[0]

        data = request.get_json()
        
        attraction_id = data["attraction_id"]
        date = data["date"] 
        time = data["time"]

        bookingsqlObject.deleteBooking(user_id, attraction_id, date, time)
        
        response = make_response( jsonify({"ok":True}) , 200)
                
        response.headers["Content-Type"] = "application/json"
        
        return response
    
    #其他問題
    else: 
        response = make_response( jsonify({"error":True, "message":"伺服器錯誤"}) , 500)
                
        response.headers["Content-Type"] = "application/json"
        
        return response

@app.route("/api/orders", methods=["POST", "GET"])
def Order():
    #訂單建立，並即將開始付款
    if request.method == 'POST':
        
        data = request.get_json()
        
        
        cookie = request.cookies.get("token")
        
        if not cookie:

            response = make_response( jsonify({"error":True, "message":"未登入，拒絕動作"}) , 403)

            response.headers["Content-Type"] = "application/json"
            
            return response

        user_info = jwt.decode(cookie, app.config["SECRET_KEY"] , algorithms=['HS256'])
        userID = UsersqlObject.getUserInfor(user_info["email"])[0]
        
        detail = "台北一日遊 " + str(userID) + " 訂單" 
        prime = data["prime"]
        price = data["order"]["price"]
        contact_name = data["order"]["contact"]["name"]
        contact_email = data["order"]["contact"]["email"]
        contact_phone = data["order"]["contact"]["phone_number"]
        pay_check = 0
        pay_order_no = str(datetime.datetime.now().year) + str(datetime.datetime.now().month) + str(datetime.datetime.now().day)
        for i in range(len(prime)):
            if i % 2 == 0:
                pay_order_no += prime[i]
        
        ordersqlObject.tableInsertOrder(userID, prime, price, contact_name, contact_email, contact_phone, pay_check, pay_order_no)
        
        for attr in data["order"]["trip"]:
            ordersqlObject.tableInsertOrderAttr(pay_order_no, attr["attraction"]["id"], attr["date"], attr["time"])
        
        pay_info = json.loads(Non3Dpay(partner_key, prime, detail, price, data["order"]["contact"]))
        
        if pay_info["status"] == 0:
            
            ordersqlObject.tableUpdate(pay_order_no)

            for attr in data["order"]["trip"]:
                bookingsqlObject.deleteBooking(userID, attr["attraction"]["id"], attr["date"], attr["time"])
            
            response = make_response( jsonify(
                {"data":{"number":pay_order_no, "payment":{"status":pay_info["status"],"message":"付款成功"}}}) , 200)

            response.headers["Content-Type"] = "application/json"
            
            return response

        else:

            response = make_response( jsonify(
                {"data":{"number":pay_order_no, "payment":{"status":pay_info["status"],"message":"付款未完成"}}}) , 200)

            response.headers["Content-Type"] = "application/json"
            
            return response

    elif request.method == "GET":
        
        cookie = request.cookies.get("token")
        
        if not cookie:

            response = make_response( jsonify({"error":True, "message":"未登入，拒絕動作"}) , 403)

            response.headers["Content-Type"] = "application/json"
            
            return response

        user_info = jwt.decode(cookie, app.config["SECRET_KEY"] , algorithms=['HS256'])
        userID = UsersqlObject.getUserInfor(user_info["email"])[0]

        data =  ordersqlObject.getOrder(userID)

        response = make_response( jsonify(data) , 200)

        response.headers["Content-Type"] = "application/json"
        
        return response
    
    else:

        response = make_response( jsonify({"error":True, "message":"伺服器錯誤"}) , 500)

        response.headers["Content-Type"] = "application/json"
        
        return response

@app.route("/api/uploads", methods=["POST", "GET"])
def uploadtoflask():

    if request.method == 'POST':

        file = request.files["uploadimgtest"]
        mimetype = file.mimetype
        filename = file.filename
        
        url = s3Object.returnURL(file, mimetype, filename)
        mode_text = request.form.get("text")
        date = request.form.get("time")
        print(date)
        RDSObject.tableInsertUrl(mode_text, date, url)

        response = make_response( jsonify({"data":{"date":date, "mode":mode_text, "url":url}}), 200)

        response.headers["Content-Type"] = "application/json"
        

        return response

    elif request.method == "GET":

        data = RDSObject.getAll()

        response = make_response( jsonify(data), 200)

        response.headers["Content-Type"] = "application/json"
        

        return response 
    
    else:
        return "not ok" , 500

@app.route("/upload")
def upload():

    return render_template("upload.html")



app.run(port=5000 , host="127.0.0.1", debug=True)

