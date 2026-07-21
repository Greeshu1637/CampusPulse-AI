import psycopg2

def get_connection():

    connection = psycopg2.connect(

        host="localhost",

        database="campuspulse_ai",

        user="postgres",

        password="root"

    )

    return connection
if __name__ == "__main__":

    conn = get_connection()

    print("Database Connected Successfully!")

    conn.close()