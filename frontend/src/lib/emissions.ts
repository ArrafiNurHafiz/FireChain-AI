import { EmissionCalculation, Hotspot } from "./types";

/**
 * IPCC 2013 Wetlands Supplement (Chapter 2: Drained Inland Organic Soils)
 * & Wooster et al. (2005) Fire Radiative Energy (FRE) biomass consumption method.
 */
export function calculateEmissions(hotspots: Hotspot[], verifiedInterventions: number = 18): EmissionCalculation {
  const totalHotspots = hotspots.length;
  
  // 1. Calculate cumulative Fire Radiative Power (MW)
  const totalFrp = hotspots.reduce((acc, h) => acc + (h.frp || 2.5), 0);

  // 2. Wooster et al. (2005) method:
  // Fuel consumption coefficient Crad = 0.368 kg DM / MJ
  // Assuming average hotspot cluster duration of 3 hours (10,800 seconds)
  // Biomass (kg) = FRP (MW = MJ/s) * 10,800 s * 0.368 kg/MJ
  const estimatedBiomassTons = (totalFrp * 10800 * 0.368) / 1000;

  // 3. Peatland area estimation (ha)
  // VIIRS 375m nominal resolution pixel = ~14 ha footprint per detection cluster
  // Clustered unique area estimation:
  const estimatedBurnedAreaHa = Math.round(totalHotspots * 4.2);

  // 4. IPCC Emission Factors for Tropical Peat (g gas / kg dry matter burned):
  // CO2: 1703 g/kg -> 1.703 t / t DM
  // CH4: 21.0 g/kg (GWP 28) -> 0.588 t CO2e / t DM
  // CO: 210 g/kg (indirect greenhouse gas) -> ~0.15 t CO2e / t DM
  // N2O: 0.15 g/kg (GWP 265) -> 0.04 t CO2e / t DM
  const co2_tco2e = Math.round(estimatedBiomassTons * 1.703);
  const ch4_tco2e = Math.round(estimatedBiomassTons * 0.588);
  const co_tco2e = Math.round(estimatedBiomassTons * 0.15);
  const n2o_tco2e = Math.round(estimatedBiomassTons * 0.04);

  const grossEmissions = co2_tco2e + ch4_tco2e + co_tco2e + n2o_tco2e;

  // 5. Avoided Emissions from verified prompt interventions (FireChain AI early response):
  // Average peat fire expansion rate: 12 ha/day if uncontained.
  // Containment within 2-4 hours prevents ~800 tCO2e per avoided flare-up.
  const avoidedEmissions = Math.round(verifiedInterventions * 785);

  return {
    total_hotspots: totalHotspots,
    total_frp_mw: Math.round(totalFrp * 10) / 10,
    estimated_burned_area_ha: estimatedBurnedAreaHa,
    biomass_consumed_ton: Math.round(estimatedBiomassTons),
    gross_emissions_tco2e: grossEmissions,
    avoided_emissions_tco2e: avoidedEmissions,
    co2_tco2e,
    ch4_tco2e,
    co_tco2e,
    n2o_tco2e,
  };
}
