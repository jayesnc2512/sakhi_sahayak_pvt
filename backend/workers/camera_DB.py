from workers.database import supabase

class cameraDB:

    @staticmethod
    def getActiveCamera():
        # Query the camera table for rows where status is 'A'
        response =supabase.table("camera").select("*").eq("status", "A").execute()
        print(response.data)
        return response.data
    
    @staticmethod
    def updateCameraStatus():
        # Update the status of all cameras to 'X'
        response = supabase.table("camera").update({"status": "X"}).neq("status", "X").execute()
        
        if response:
            print("Camera status updated successfully.")
        else:
            print(f"Failed to update camera status: {response.error_message}")


