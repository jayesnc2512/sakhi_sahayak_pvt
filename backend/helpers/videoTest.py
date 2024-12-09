from ml_models.gender_classification import genderClassification 
from ml_models.violence_detection import ViolenceDetector

class videoTest:
    @staticmethod
    async def invokeGenderClassification(input_source,websocket):
        await genderClassification.gender_classification_main(input_source,websocket)
    
    @staticmethod
    async def invokeViolenceDetection(input_source,websocket):
        await ViolenceDetector.run(input_source,websocket)

    