from workers.database import supabase

class alertsDB:

    @staticmethod
    def getAlerts():
        response =supabase.table("alerts").select("*").execute()
        print(response.data)
        return response.data
    
    @staticmethod
    def insertAlerts(alert_data):
        try:
            supabase.table("alerts").insert(alert_data).execute()
        except Exception as e:
            print("error in inserting the alert")
            
    @staticmethod
    def updateReadStatus(id):
        try:
            supabase.table("alerts").update({"read_status": 1}).eq("id", id).execute()
        except Exception as e:
            print("error in updatging the read status of the alert")

    @staticmethod
    def addComplaint(complaint:dict):
        try:
            complaint_data={
                "description":complaint["desciption"],
                "proof_link":complaint["proof_link"]
            }
            supabase.table("complaints").insert(complaint_data).execute()
        except Exception as e:
            print("Error in add COmaplint")

    @staticmethod
    def getComplaints():
        response = supabase.table("complaints").select("*").execute()
        return response.data