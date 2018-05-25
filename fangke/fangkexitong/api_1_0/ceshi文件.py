# # coding=utf-8
# # 导入日期模块
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from fangkexitong.models import Users, Invitation, InvitingPerson, Applicant, Visitors, PersonOpen


import time,datetime

# b = datetime.datetime.now()
# a = datetime.datetime.strptime(str(b),"%Y-%m-%d")
# print(a)




# a = datetime.datetime.now().strftime("%Y-%m-%d")
#
print(type(time.localtime(time.time())))

# print(time.strftime('%Y-%m-%d',))









# ENGINE = create_engine("mssql+pymssql://visitor:12345678@cnspec.myds.me:61433/visitor?charset=utf8",
#                        convert_unicode=True)
# Session = sessionmaker(bind=ENGINE, autocommit=False, autoflush=False)
#
# session = Session()

# invitperon = session.query(InvitingPerson).filter_by(open_id="110",full_name="于小洋", phone="13796325874").first()
# print(invitperon)

# invitingperson = session.query(InvitingPerson).filter_by(=110).first()
# print(invitingperson)
# user = session.query(Users).filter_by(username=13761953033).first()
# invitation = session.query(Invitation).filter_by(id=20).first()
# print(user.username)

# personopens = session.query(Invitation).filter_by(id=20).first()
# print(personopens.info_data)
# user = Users(username="13793801039",password="77585214aq",full_name="hahha",phone="13793801039",company="dongbei")
# session.add(user)
# c = Invitation(full_name="高伟",phone="15912369548",visitor_count=3,visit_time="2018-05-19",position="上海",reason="喝茶",check_in="10f",user_id="13761953033",state="已生效")
# a = InvitingPerson(open_id="110",full_name="高伟",phone="15912369548",email="zuiaichuju@163.com",id_type="身份证",id_num="370983198876456345",company="南京")

# b = PersonOpen(inperson_id="110",inperson_name="高伟",invit_id=c.id,user_id="13761953033",user_name="李贞",user_comp="上海")
# session.add(a)
# session.add(b)
# session.add(c)
# print(c.id)
# invitation = session.query(Invitation).filter_by(id=2).first()
# print(invitation)
# a = session.query(Users).first()
# user = Users()
# user.username = 13793801038
# user.password = 77585214
# user.full_name = "姜道强".decode()
# user.company = "上海臻言".decode()
# user.phone = 13793801038
# invits = session.query(Invitation).filter(Invitation.user_id == "13761953033").order_by(Invitation.create_time.desc()).all()
# for i in invits:
#     print(i.id)

# invits = Invitation.query.filter(Invitation.user_id=="13761953033").order_by(
#                 Invitation.create_time.desc()).paginate(1, 20, False)
#             # invits = session.query(Invitation).filter(Invitation.user_id == "13793801039").all()
# print(invits)
#
# app = Applicant(full_name="姜道强".decode("utf-8"),phone="13793801038",ap_company="上海".decode("utf-8"),company="上海".decode("utf-8"),visit_time="2018-05-29",reason="wu",invit_name="李贞".decode("utf-8"),user_id="13761953033",state="待审核".decode("utf-8"))
# a = session.query(Applicant).filter_by(invit_name="李贞").first()
# print(a.create_time)
# app = session.query(Invitation).all()

# app = session.query(Users).filter_by(username=13621970895).first()
#
# print(app)


# for i in app:
#     i.user_fullname = "李祯".decode("utf-8")
#     i.user_phone = "13761953033".decode("utf-8")
# # session.add(app)
# session.commit()




# invit = session.query(Users).filter_by(username=43).first()
# print(invit)
# invitingperson = session.query(InvitingPerson).filter_by(open_id="o0sd2wPshe5YXXs-0hhEu1eryyac").first()

# user = session.query(Invitation).filter_by(user_id="13761953033").all()
# print(user[-1].id)

# personopens = session.query(PersonOpen).filter_by(inperson_id="o0sd2wPshe5YXXs-0hhEu1eryyac", invit_id=21, delete=False).filter(PersonOpen.visitor_id != "").all()

# print(invitingperson)
# print(a.full_name)
# user = session.query(Users).filter_by(username=13761953033).first()
# user_name = user.full_name
# print(user_name)
# invit = session.query(Invitation).filter_by(id=20).first()
# print(invit.user_id)
#
# session.commit()
# Session.close_all()
# # import pymssql
# print(c.id)
# db = pymssql.connect("172.16.1.6", "visitor", "12345678", "visitor", charset='utf8')
#
# # 使用cursor()方法获取操作游标
# cursor = db.cursor()
#
# # 使用execute方法执行SQL语句
# cursor.execute("""INSERT INTO fk_users VALUES ("xuanlanwuta","77585214aq","姜道强","13793801038","上海臻言");""")
#
# # 使用 fetchone() 方法获取一条数据
# data = cursor.fetchone()[0]
# # data = str(data)
# print(data)
#
# session.close()
# # 关闭数据库连接
# db.close()
#
# import time
# a = "124"+str(time.time())
# print(a)