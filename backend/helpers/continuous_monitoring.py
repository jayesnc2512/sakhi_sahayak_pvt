from workers.camera_DB import cameraDB
from helpers.videoTest import videoTest
import asyncio


class continuousMonitoring:
    
    @staticmethod
    async def getCameras():
        try:
            activeCameras=cameraDB.getActiveCamera()
            cam1=activeCameras[0]
            # cameraDB.updateCameraStatus()
            print("input_source",cam1)
            return cam1
        except Exception as e:
            print(f"Error in getCameras: {e}")

    @staticmethod
    async def startMontitoring(websocket):
        try:
 # Start the gender classification and violence detection tasks
            input_source=await continuousMonitoring.getCameras()
            if(input_source):
                async def gender_classification_task():
                    try:
                        await videoTest.invokeContinuousGenderClassification(input_source, websocket)
                    except Exception as e:
                        print(f"Error in gender classification task: {e}")

                # async def violence_detection_task():
                #     try:
                #         await videoTest.invokeContinuousViolenceDetection(input_source, websocket)
                #     except Exception as e:
                #         print(f"Error in violence detection task: {e}")

                # Run both tasks concurrently
                await asyncio.gather(
                    gender_classification_task(),
                    # violence_detection_task()
                )
                await asyncio.sleep(0) 
        except Exception as e:
            print(f"Error in startMontitoring: {e}")
    

