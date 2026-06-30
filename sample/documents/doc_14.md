TECHNICAL MAINTENANCE BULLETIN: IMOS NATIONAL MOORING NETWORK DATA QUALITY ADVISORY

Date: October 24, 2023
Issuer: Integrated Marine Observing System (IMOS) / National Mooring Network Facility
Subject: Identification of Data Anomalies in ADCP Instrumentation Due to Bio-accumulation

1. SCOPE AND BACKGROUND
The Integrated Marine Observing System (IMOS) National Mooring Network Facility operates a critical suite of marine monitoring infrastructure across the Australian shelf. The facility is responsible for maintaining high-frequency observations of physical and chemical parameters, utilizing a series of sub-surface and surface moorings. This bulletin provides a technical update regarding current data quality status for specific moored assets within the national network.

2. DATA ANALYSIS AND OBSERVED ANOMALIES
Recent Quality Control (QC) assessments of streamed and recovered data have identified significant anomalies within the physical variable streams. Specifically, analytical focus has been directed toward:
- Sound Speed (SSPD): Observed deviations from localized climatological norms.
- Zonal Current Velocity (UCUR): Inconsistent velocity readings that do not align with neighboring observational nodes or historical sea-state patterns.

The anomalies are characterized by a gradual signal drift that deviates from expected baseline performance over the duration of the deployment period.

3. ROOT CAUSE IDENTIFICATION: BIOLOGICAL FOULING
Technical investigation by the National Mooring Network Facility has identified the root cause of these anomalies as biological fouling on the Acoustic Doppler Current Profiler (ADCP) sensor heads. As the ADCP units remain in the water column for extended periods, the accumulation of marine organisms (bio-fouling) on the transducer faces obstructs and degrades the acoustic signal.

4. TECHNICAL EXPLANATION OF SENSOR ERROR
The causal path for the observed data anomalies is directly linked to the physical presence of bio-accumulation on the instrument sensors. This layer of organic material acts as an insulating barrier and a source of signal interference. 

One of the most notable impacts of this accumulation is an apparent drop in recorded temperature. Because the ADCP thermistor is often located near or integrated with the transducer assembly, the layer of bio-fouling creates a micro-environment that sequesters the sensor from the surrounding ambient water flow, leading to localized cooling effects or thermal lag that does not reflect the actual bulk water temperature. This temperature error subsequently flows through to the sound speed (SSPD) calculations, as sound speed is a temperature-dependent variable. Furthermore, the physical obstruction of the acoustic beams leads to a decrease in the signal-to-noise ratio, resulting in the observed drift and inaccuracies in the Zonal Current Velocity (UCUR) measurements.

5. MAINTENANCE FORECAST AND DATA RECOVERY
Users of IMOS data should note that these sensor errors are progressive and will persist through the remainder of the current deployment. A forecast for data stabilization indicates that all values will reset to nominal accuracy levels following the next scheduled maintenance and cleaning cycle. During this cycle, the ADCP units will be recovered, the sensor faces manually cleared of all biological growth, and the units recalibrated before redeployment.

Analysts are advised to apply appropriate flags to SSPD and UCUR variables collected during the latter stages of the current deployment window. This advisory is limited to the technical performance of ADCP sensors and does not address data from other non-ADCP instruments on the mooring arrays.