# # coding=utf-8
# # 导入日期模块
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from fangkexitong.models import Users, Invitation, InvitingPerson, Applicant, Visitors, PersonOpen

ENGINE = create_engine("mysql://root:218830@127.0.0.1/visitor0517?charset=utf8",
                       convert_unicode=True)
Session = sessionmaker(bind=ENGINE, autocommit=False, autoflush=False)

session = Session()

# invitation = Invitation(full_name="于洋",phone="13793801039",visitor_count="3",visit_time="2018-05-19",leave_data="2018-05-22",position="上海臻言2层",reason="商量图表事件",check_in="2",user_id="xuanlanwuta",state="已生效")
invitation = PersonOpen(inperson_id="1",inperson_name="于洋",invite_id="1",user_id="xuanlanwuta",user_name="姜道强",user_comp="上海臻言")


session.add(invitation)
session.commit()
Session.close_all()
# import pymssql
#
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
#
# # 关闭数据库连接
# db.close()


