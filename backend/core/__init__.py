# Install PyMySQL as MySQLdb replacement before Django loads the MySQL backend.
# Required on Windows where mysqlclient (C extension) isn't easily installable.
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass
