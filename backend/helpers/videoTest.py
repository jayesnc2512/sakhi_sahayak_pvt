from ml_models.gender_classification import genderClassification 
from ml_models.violence_detection import ViolenceDetector
# from ml_models.cm_gc import continuousGenderClassification 
# from ml_models.cm_violence import continuousViolenceDetector
from ml_models.Realtime_analysis.gc import continuousGenderClassification
from ml_models.Realtime_analysis.violence import continuousViolenceDetector



class videoTest:
    @staticmethod
    async def invokeGenderClassification(input_source,websocket):
        await genderClassification.gender_classification_main(input_source,websocket)
    
    @staticmethod
    async def invokeViolenceDetection(input_source,websocket):
        await ViolenceDetector.run(input_source,websocket)

    @staticmethod
    async def invokeContinuousGenderClassification(input_source,websocket):
        await continuousGenderClassification.gender_classification_main(input_source,websocket)
    
    @staticmethod
    async def invokeContinuousViolenceDetection(input_source,websocket):
        await continuousViolenceDetector.run(input_source,websocket)

    

    