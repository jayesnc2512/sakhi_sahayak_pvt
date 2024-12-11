
from workers.database import supabase

class usersDB:
    @staticmethod
    def getAllUsers():
        response = supabase.table("users").select("*").execute()
        print(response)


