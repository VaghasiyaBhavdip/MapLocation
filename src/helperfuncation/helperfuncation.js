import Geolocation from "@react-native-community/geolocation";
import { PermissionsAndroid } from "react-native";

export const getLocationAccessPermission=async()=>{
    try{
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Required',
          message: 'This App needs to Access your location',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED)
        return true
      else
        return false
    }
    catch(error){
        return false
    }
}
export const getLocations = async () => {
    try {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    const Lastlocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    resolve(Lastlocation);
                },
                (error) => {
                    console.log('Error getting location:', error.message);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 30000,
                }
            );
        });
    } catch (error) {
        console.log(error);
        throw error; // Rethrow the error to be caught by the calling code
    }
};

