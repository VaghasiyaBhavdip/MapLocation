
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid, LogBox, Text, NativeModules, NativeEventEmitter } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAP_KEY } from './src/constants';
import { getLocationAccessPermission, getLocations } from './src/helperfuncation/helperfuncation';

const { BatteryStatus } = NativeModules;
const batteryStatusEmitter = new NativeEventEmitter(BatteryStatus);

const App = () => {
  LogBox.ignoreAllLogs()
  const [userLocations, setUserLocations] = useState([]);
  const [triangleCoordinates, setTriangleCoordinates] = useState(null);
  const [isPowerSaveMode, setIsPowerSaveMode] = useState(false);

  
  useEffect(() => {
    const subscription = batteryStatusEmitter.addListener(
      'batteryOptimizationStatus',
      (status) => {
        console.log('Received batteryOptimizationStatus event:', status);
        setIsPowerSaveMode(status);
      }
    );

    BatteryStatus.isBatterySaverModeEnabled();

    return () => {
      subscription.remove();
    };
  }, []);
  const updateLocation = async () => {
    try {
        let permission = await getLocationAccessPermission();

        if (permission) {
            let Lastlocation = await getLocations();
            // setUserLocations([...userLocations,Lastlocation]);
            setUserLocations((prevLocations) => [...prevLocations, Lastlocation]);
            setTriangleCoordinates(getTriangleCoordinates(Lastlocation));
        } else {
            console.log('Location permission denied');
        }
    } catch (error) {
        console.error('Error in getLocation:', error);
    }
  };
  useEffect(()=>{
      updateLocation()
  },[])
  
  // Fetch user's location every 1 minute
  useEffect(() => {
    const locationIntervalId = setInterval(() => {
      updateLocation();
    }, 60000);

    return () => clearInterval(locationIntervalId); // Cleanup on unmount
  }, []);

  const getTriangleCoordinates = (center) => {
    return [
      { latitude: center.latitude + 0.0001, longitude: center.longitude - 0.0001 },
      { latitude: center.latitude - 0.0001, longitude: center.longitude - 0.0001 },
      { latitude: center.latitude, longitude: center.longitude + 0.0001 },
    ];
  };
  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapStyle}
        showsUserLocation
        followsUserLocation
        zoomEnabled={true}
        showsMyLocationButton
        maxZoomLevel={20}
        region={{
          latitude: userLocations.length > 0 ? userLocations[userLocations.length - 1].latitude : 0,
          longitude: userLocations.length > 0 ? userLocations[userLocations.length - 1].longitude : 0,
          latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
        }}
      >
        {/* Render Polygons for each user location */}
        {userLocations.map((location, index) => (
          <Polygon
            key={index}
            coordinates={getTriangleCoordinates(location)}
            fillColor="red"
            strokeColor='red'
            zIndex={1}
          />
        ))}

        {/* MapViewDirections line */}
        {userLocations.length > 1 && (
          <MapViewDirections
            origin={userLocations[0]}
            waypoints={userLocations.slice(1).map(location => location)}
            destination={userLocations[userLocations.length - 1]}
            apikey={GOOGLE_MAP_KEY}
            strokeWidth={2}
            strokeColor='red'
          />
        )}

        {/* Custom triangle marker */}
        {triangleCoordinates && (
          <Polygon
            coordinates={triangleCoordinates}
            fillColor="red"
            strokeColor='red'
            zIndex={2}
            
          />
        )}
      </MapView>
      <View style={styles.batteryStatusView}>
        <Text style={styles.batteryStatusText}>Battery Optimization Status : { isPowerSaveMode ? 'On' : 'Off'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  batteryStatusView:{
    position:'absolute',
    backgroundColor:'white',
    shadowColor:'rgba(0,0,0,0.8)',
    elevation:10,
    padding:12,
    borderRadius:10,
    top:10,
    left:10
  },
  batteryStatusText:{
    fontWeight:'600',
    fontSize:15
  }
});

export default App;