import mysql.connector
from mysql.connector import pooling

class MySQLCon:

    def __init__(self , config):
        # 資料庫參數設定
        self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(**config)
    
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()
        

    def tableInsertAtr(self , img_id, name, category, description, address, transport, MRT, latitude, longitude):
   
        #建立資料庫insert相關命令(table寫死 , 寫入id, name, category, description, address, transport, MRT, latitude, longtitude)

        insert_command = ("insert into Attraction(img_id, name, category, description, address, transport, MRT, latitude, longitude)"
        " Values (%s , %s , %s, %s , %s , %s, %s , %s , %s);" ) 
        
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(insert_command , (img_id, name, category, description, address, transport, MRT, latitude, longitude,))
            self.conn.commit()

    def tableInsertImg(self , img_id, image_url):
   
        #建立資料庫insert相關命令(table寫死 , 寫入img_id, image_url)

        insert_command = "insert into Attr_img(img_id, image_url) Values (%s , %s);" 
        
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(insert_command , (img_id, image_url,))
            self.conn.commit()

    def getAttraction_withPage(self , page, keyword):
        
        #先確認page正確與否
        if page < 0:
            error_json = {}
            error_json["error"] = True
            error_json["message"] = "頁數請由第零頁開始"

            return error_json 
        
        # 2.先得出得到的景點數
        attr_count_command =  "select count(*) from Attraction where name like %s"
        
        keyword = "%" + keyword + "%"
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(attr_count_command , (keyword,))
            attr_count = cursor.fetchone()[0]
            
        #景點數目為0的錯誤
        if attr_count == 0 :
            error_json = {}
            error_json["error"] = True
            error_json["message"] = "您輸入的景點未搜尋到"

            return error_json 
        
        # 3.從資料庫中拉出符合keyword資料
        attr_list_command = "select * from Attraction where name like %s limit %s , %s"
        img_list_command =  "select image_url from Attr_img where img_id = %s"
        
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(attr_list_command , (keyword , page*12 , 12,) )
            attr_list = cursor.fetchall()
            
        # 4.開始建構python字典 -> 之後會轉成json格式
        data_list = {}
        data = []
        for attr in attr_list:
            box = {}
            box_img = []
            box["id"] = attr[1]
            box["name"] = attr[2]
            box["category"] = attr[3]
            box["description"] = attr[4]
            box["address"] = attr[5]
            box["transport"] = attr[6]
            box["mrt"] = attr[7]
            box["latitude"] = attr[8]
            box["longitude"] = attr[9]
            
            with self.conn.cursor(buffered=True) as cursor:
                cursor.execute(img_list_command , (str(attr[1]), ) )
                img_list = cursor.fetchall()
                for img in img_list:
                    box_img.append(img[0])
            
            box["images"] = box_img
            
            data.append(box)
        
        #已完成json中data內的所有值建構，開始規劃回傳值需要哪些data，先思考傳入page正確與否
        #搜尋關鍵字所需頁數
        checkPage = ( attr_count - 1 ) // 12
        
        if page < checkPage :
            data_list["nextPage"] = page + 1
        else:
            data_list["nextPage"] = None
        
        data_list["data"] = data

        return data_list

    def fromIdSearchAttr(self , img_id):

        img_id_command = "select img_id from Attraction where id= %s"
        command = "select * from Attraction where img_id = %s"
        img_list_command =  "select image_url from Attr_img where img_id = %s"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (img_id,))
            attr = cursor.fetchone()

        if attr == None:
            error = {}
            error["error"] = True
            error["message"] = "您輸入的id搜尋不到景點(輸入範圍 : 1-319)"
            return error

        data_list = {}  
        box = {}
        box_img = []
        box["id"] = attr[1]
        box["name"] = attr[2]
        box["category"] = attr[3]
        box["description"] = attr[4]
        box["address"] = attr[5]
        box["transport"] = attr[6]
        box["mrt"] = attr[7]
        box["latitude"] = attr[8]
        box["longitude"] = attr[9]
        
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(img_list_command , (str(attr[1]), ) )
            img_list = cursor.fetchall()
            for img in img_list:
                box_img.append(img[0])
        
        box["images"] = box_img
        
        data_list["data"] = box

        return data_list

class User_MySQLCon:

    def __init__(self , config):
        # 資料庫參數設定
        self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(**config)
    
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

    def tableInsertUser(self, email_address, password, username):

        #建立資料庫insert相關命令(table寫死 , 寫入 username、信箱、密碼，並做檢查機制)

        insert_command = ("insert into userfromweb( email_address, password, username)"
        " Values (%s , %s , %s);" )

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(insert_command , (email_address , password , username,) )
            self.conn.commit()

    def SignUpUserCheck(self, username , email_address):

        check_username_command= "select count(username) FROM userfromweb WHERE username=%s;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(check_username_command , (username,) )
            self.conn.commit()
            username_check = cursor.fetchone()

        check_email_command = "select count(email_address) FROM userfromweb WHERE email_address=%s;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(check_email_command , (email_address,) )
            self.conn.commit()
            email_check = cursor.fetchone()

        return username_check , email_check

    def SignInUserCheck(self, email_address, password):

        check_email_command= "select count(email_address) FROM userfromweb WHERE email_address=%s;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(check_email_command , (email_address,) )
            self.conn.commit()
            email_check = cursor.fetchone()

        check_password_command = "select password from userfromweb where email_address=%s;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute( check_password_command , (email_address,) )
            self.conn.commit()
            password_check = cursor.fetchone()

        return email_check , password_check

    def getUserInfor(self, email_address):

        command = "select id, email_address, username from userfromweb where email_address=%s"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (email_address,) )
            self.conn.commit()
            Info = cursor.fetchone()

        return Info

class Booking_SQL:

    def __init__(self , config):
        # 資料庫參數設定
        self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(**config)
    
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

    def tableInsertBooking(self, user_id, attraction_id, date, time, price):

        insert_command = ("insert into booking ( user_id, attraction_id, date, time, price)"
        " Values (%s , %s , %s, %s , %s);" )

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(insert_command , ( user_id, attraction_id, date, time, price,) )
            self.conn.commit()

    def getImgaeUrl(self, attraction_id):

        image_id_command = "select img_id from Attraction where id=%s"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(image_id_command , (attraction_id,) )
            self.conn.commit()
            img_id = cursor.fetchone()
        
        image_url_command = "select image_url from Attr_img where img_id = %s limit 1"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(image_url_command , (img_id[0],) )
            self.conn.commit()
            img_url = cursor.fetchone()
        
        return img_url
        
    def getBooking(self, user_id):
        
        #user_id, 景點id, 景點名稱, 景點地址, 預定日期, 預定時間, 預定價錢
        command = ("select userfromweb.id, Attraction.id, Attraction.name, Attraction.address, booking.date, booking.time, booking.price"
        " from booking" 
        " left join userfromweb on booking.user_id = userfromweb.id" 
        " left join Attraction on booking.attraction_id = Attraction.id"
        " where booking.user_id=%s;")
        
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (user_id,) )
            self.conn.commit()
            data = cursor.fetchall()
            

        schedule_list = []
        return_data = {}
        if data:

            for sql in data:

                attraction = {}
                attraction["id"] = sql[1]
                attraction["name"] = sql[2]
                attraction["address"] = sql[3]
                attraction["image"] = self.getImgaeUrl(sql[1])[0]

                schedule = {}
                schedule["attraction"] = attraction
                schedule["date"] = sql[4]
                schedule["time"] = sql[5]
                schedule["price"] = sql[6]
                schedule_list.append(schedule)

            return_data["data"] = schedule_list

            return return_data
        
        else:
            return_data["data"] = None

            return return_data
        
    def deleteBooking(self, user_id, attraction_id, date, time):

        command = "delete from booking where user_id=%s and attraction_id=%s and date=%s and time=%s;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (user_id, attraction_id, date, time,) )
            self.conn.commit()

class Order_SQL:

    def __init__(self , config):
        # 資料庫參數設定
        self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(**config)
    
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

    def tableInsertOrder(self, userID, prime, price, contact_name, contact_email, contact_phone, pay_check, pay_order_no):

        insert_command = ("insert into WebOrder (userID, prime, price, contact_name, contact_email, contact_phone, pay_check, pay_order_no)"
        " Values (%s, %s, %s, %s, %s, %s, %s, %s);")

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(insert_command , ( userID, prime, price, contact_name, contact_email, contact_phone, pay_check, pay_order_no,) )
            self.conn.commit()             

    def tableInsertOrderAttr(self, order_no, attr_id, date, time):

        insert_command = ("insert into orderAttr(order_no, attr_id, date, time)"
        " Values (%s, %s, %s, %s);")

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(insert_command, (order_no, attr_id, date, time,) )
            self.conn.commit() 

    def tableUpdate(self, order_no):
        
        insert_command = "UPDATE WebOrder SET pay_check  = 1 WHERE pay_order_no = %s;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(insert_command, (order_no,) )
            self.conn.commit() 
    
    def getImgaeUrl(self, attraction_id):

        image_id_command = "select img_id from Attraction where id=%s"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(image_id_command , (attraction_id,) )
            self.conn.commit()
            img_id = cursor.fetchone()
        
        image_url_command = "select image_url from Attr_img where img_id = %s limit 1"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(image_url_command , (img_id[0],) )
            self.conn.commit()
            img_url = cursor.fetchone()
        
        return img_url

    def getOrderNo(self, user_id):

        command = "select pay_order_no from WebOrder where userID = %s"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (user_id,) )
            self.conn.commit()
            OrderNo = cursor.fetchall()

        return OrderNo

    def getOrder(self, user_id):
        
        OrderNo = self.getOrderNo(user_id)

        command = ("select orderAttr.order_no, WebOrder.price, orderAttr.attr_id, Attraction.name, Attraction.address, orderAttr.date," 
        "orderAttr.time, WebOrder.contact_name, WebOrder.contact_email, WebOrder.contact_phone, WebOrder.pay_check"
        " from orderAttr" 
        " left join Attraction on orderAttr.attr_id = Attraction.id left join WebOrder on orderAttr.order_no = WebOrder.pay_order_no" 
        " where orderAttr.order_no = %s;")

        data = {}
        orderinfo = []
        
        for num in OrderNo:
            
            with self.conn.cursor(buffered=True) as cursor:
                cursor.execute(command , (num[0],))
                self.conn.commit()
                OrderDetail = cursor.fetchall()
            
            component = {}
            component["number"] = OrderDetail[0][0]
            component["price"] = OrderDetail[0][1]
            trip_list = []
            
            for od in OrderDetail:
                attraction = {}
                attraction["id"] = od[2]
                attraction["name"] = od[3]
                attraction["address"] = od[4]
                attraction["image"] = self.getImgaeUrl(od[2])[0]
                trip = {}
                trip["attraction"] = attraction
                trip["date"] = od[5]
                trip["time"] = od[6]
                trip_list.append(trip)
            
            component["trip"] = trip_list
            contact = {}
            contact["name"] = od[7]
            contact["email"] = od[8]
            contact["phone"] = od[9]
            component["contact"] = contact
            component["status"] = od[10]

            orderinfo.append(component)

        data["data"] = orderinfo

        return data
        
        
