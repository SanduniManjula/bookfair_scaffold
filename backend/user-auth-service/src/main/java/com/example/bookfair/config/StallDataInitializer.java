package com.example.bookfair.config;

import com.example.bookfair.user.model.Stall;
import com.example.bookfair.user.repository.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class StallDataInitializer implements CommandLineRunner {

    @Autowired
    private StallRepository stallRepository;

    // Array of polygon coordinates (first X coordinate of each polygon) - all 436 polygons
    // These are extracted from the frontend map to determine hall groupings
    private static final int[] POLYGON_X_COORDINATES = {
        1736, 1736, 1736, 1736, 1355, 1326, 1295, 1263, 1389, 1323, 1199, 1230, 1260, 1291, 1322, 1322,
        1413, 1517, 1547, 1579, 1578, 1592, 1591, 1547, 1517, 1488, 1458, 1413, 1322, 1289, 1259, 1228,
        1187, 1143, 1185, 1230, 1168, 1230, 1291, 1320, 1197, 1229, 1258, 1322, 1320, 1322, 1406, 1406,
        1406, 1545, 1679, 1679, 1681, 1681, 1662, 1631, 1603, 1571, 1539, 1507, 1466, 1423, 1312, 1267,
        1237, 1207, 1176, 1144, 1084, 1098, 1098, 1098, 1098, 1098, 1098, 1130, 1160, 1191, 1224, 1250,
        1291, 1335, 1380, 1421, 1464, 1562, 1967, 2031, 2065, 2095, 2155, 2094, 2061, 2032, 2004, 2091,
        2124, 2154, 2184, 2217, 2248, 2215, 2183, 2153, 2121, 2029, 2242, 2242, 2244, 2272, 2336, 2274,
        2242, 2214, 2145, 2145, 2189, 2298, 2298, 2327, 2359, 2373, 2373, 2373, 2373, 2355, 2326, 2265,
        2235, 2191, 2147, 2102, 2043, 2012, 1982, 1965, 1870, 1870, 1870, 1870, 2079, 2103, 2142, 2180,
        2213, 2248, 2248, 2213, 2180, 2142, 2103, 2118, 2154, 2189, 2227, 2263, 2263, 2227, 2189, 2154,
        2118, 2104, 2142, 2177, 2211, 2251, 2251, 2211, 2177, 2142, 2104, 2279, 2241, 2196, 2161, 2117,
        1310, 1427, 1427, 1427, 1384, 1384, 1384, 1310, 1310, 1310, 1310, 1358, 1399, 1434, 1496, 1496,
        1496, 1496, 1496, 1496, 1496, 1496, 1496, 1496, 1496, 1511, 1487, 1460, 1470, 1470, 1470, 1470,
        1470, 1470, 1470, 1470, 1470, 1470, 1470, 1470, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400,
        1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1407, 1383, 1357, 1374, 1374, 1374, 1374, 1374,
        1374, 1374, 1374, 1374, 1374, 1374, 1374, 1374, 1374, 1374, 1374, 1374, 1374, 1290, 1290, 1290,
        1290, 1290, 1290, 1290, 1290, 1290, 1290, 1290, 1267, 1267, 1267, 1267, 1267, 1267, 1267, 1267,
        1267, 1267, 1267, 1220, 1220, 1220, 1220, 1220, 1220, 1220, 1220, 1220, 1220, 1220, 1311, 1284,
        1258, 1235, 1211, 1184, 1194, 1194, 1194, 1194, 1194, 1194, 1194, 1194, 1194, 1194, 1194, 824, 824,
        824, 824, 824, 824, 824, 824, 824, 824, 824, 824, 824, 824, 824, 894, 894, 894, 894, 894, 894,
        894, 894, 894, 894, 894, 894, 894, 894, 894, 895, 730, 731, 731, 731, 731, 731, 731, 731, 731,
        731, 731, 731, 731, 731, 731, 731, 731, 731, 730, 773, 811, 937, 977, 1019, 1016, 1016, 1016, 1016,
        1016, 1016, 1016, 1016, 1016, 1016, 1016, 1016, 1016, 1016, 1016, 490, 490, 490, 490, 490, 490,
        490, 490, 490, 573, 573, 573, 573, 573, 573, 573, 573, 573, 573, 410, 414, 414, 414, 414, 414,
        414, 414, 414, 414, 414, 186, 570, 354, 41, 26, 930, 879, 821, 767, 713, 658, 606, 553, 930, 879,
        821, 767, 713, 658, 606, 553, 930, 878, 825, 769, 715, 663, 605, 553
    };
    
    // Array of polygon Y coordinates (first Y coordinate of each polygon) - all 436 polygons
    private static final int[] POLYGON_Y_COORDINATES = {
        925, 884, 769, 722, 729, 756, 788, 819, 820, 883, 722, 688, 656, 626, 567, 567, 569, 594, 627, 656,
        720, 753, 796, 753, 721, 689, 657, 610, 658, 688, 721, 755, 801, 756, 892, 894, 955, 954, 954, 986,
        986, 1018, 1050, 1035, 986, 1035, 1035, 986, 986, 842, 904, 853, 768, 724, 683, 650, 620, 587, 556, 524,
        477, 477, 523, 524, 556, 587, 618, 649, 649, 724, 767, 813, 856, 902, 943, 980, 1011, 1045, 1077, 1106,
        1123, 1123, 1123, 1123, 1168, 1064, 883, 750, 718, 689, 751, 750, 783, 811, 783, 875, 840, 812, 777, 745,
        777, 811, 840, 875, 904, 934, 1033, 970, 905, 875, 938, 938, 970, 1002, 1070, 1070, 1070, 1085, 1022, 991,
        959, 930, 884, 840, 795, 760, 727, 667, 609, 609, 609, 609, 634, 666, 697, 837, 748, 795, 882, 927,
        2034, 1979, 1979, 1979, 1979, 1979, 1934, 1934, 1934, 1934, 1934, 1869, 1870, 1872, 1872, 1872, 1831, 1831, 1831, 1831,
        1831, 1762, 1762, 1763, 1763, 1763, 1722, 1722, 1722, 1722, 1722, 1627, 1627, 1627, 1627, 1627, 1641, 1836, 1877, 1920,
        1920, 1877, 1836, 1836, 1879, 1917, 1962, 2010, 2010, 2010, 2363, 2383, 2401, 2418, 2437, 2458, 2493, 2511, 2534, 2554,
        2572, 2590, 2629, 2629, 2629, 2590, 2572, 2554, 2534, 2511, 2493, 2458, 2437, 2418, 2401, 2383, 2363, 2340, 2363, 2383,
        2402, 2420, 2439, 2458, 2478, 2497, 2533, 2552, 2570, 2593, 2613, 2630, 2649, 2667, 2705, 2705, 2705, 2667, 2649, 2630,
        2613, 2593, 2570, 2552, 2533, 2497, 2478, 2458, 2439, 2420, 2402, 2383, 2363, 2340, 2457, 2477, 2495, 2515, 2534, 2554,
        2589, 2608, 2628, 2646, 2666, 2666, 2646, 2628, 2608, 2589, 2554, 2534, 2515, 2495, 2477, 2457, 2455, 2474, 2494, 2512,
        2533, 2552, 2589, 2608, 2627, 2645, 2667, 2706, 2706, 2706, 2706, 2706, 2706, 2667, 2645, 2627, 2608, 2589, 2552, 2533,
        2512, 2494, 2474, 2455, 2084, 2048, 2013, 1978, 1941, 1906, 1871, 1838, 1799, 1764, 1731, 1694, 1661, 1621, 1588, 1554,
        1553, 1588, 1621, 1661, 1694, 1731, 1764, 1799, 1838, 1871, 1906, 1941, 1978, 2013, 2048, 2084, 2135, 2135, 2092, 2059,
        2021, 1987, 1955, 1920, 1889, 1854, 1822, 1787, 1755, 1723, 1693, 1656, 1621, 1591, 1553, 1500, 1500, 1500, 1500, 1500,
        1500, 1553, 1586, 1623, 1655, 1685, 1718, 1753, 1785, 1820, 1852, 1887, 1920, 1954, 1986, 2019, 2054, 1675, 1711, 1748,
        1788, 1828, 1868, 1907, 1944, 1983, 1988, 1948, 1910, 1869, 1832, 1792, 1756, 1713, 1678, 1637, 2058, 1988, 1951, 1911,
        1871, 1831, 1794, 1753, 1713, 1678, 1637, 1607, 796, 793, 201, 391, 368, 368, 368, 368, 368, 368, 368, 368,
        317, 317, 317, 317, 317, 317, 317, 317, 235, 235, 235, 235, 235, 235, 235, 235
    };

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (stallRepository.count() == 0) {
            initializeStalls();
        } else if (stallRepository.count() < 436) {
            // If we have fewer than 436 stalls, add the missing ones
            addMissingStalls();
        }
    }

    private void initializeStalls() {
        String[] sizes = {"SMALL", "MEDIUM", "LARGE"};
        
        // Group polygons by hall to track numbering within each hall
        Map<Character, List<Integer>> hallGroups = groupPolygonsByHall();
        
        // Create a map to track the current number for each hall
        Map<Character, Integer> hallCounters = new HashMap<>();
        for (Character hall : hallGroups.keySet()) {
            hallCounters.put(hall, getHallStartNumber(hall));
        }
        
        // Create stalls in polygon index order (0 to 435) to match frontend mapping
        // This ensures stall[0] corresponds to polygon[0], etc.
        for (int polygonIndex = 0; polygonIndex < POLYGON_X_COORDINATES.length; polygonIndex++) {
            int x = POLYGON_X_COORDINATES[polygonIndex];
            int y = (polygonIndex < POLYGON_Y_COORDINATES.length) 
                ? POLYGON_Y_COORDINATES[polygonIndex] 
                : (100 + (polygonIndex * 60) % 2800);
            
            // Determine hall for this polygon
            char hallLetter = determineHallLetter(x, y);
            
            // Get and increment the counter for this hall
            int stallNumber = hallCounters.get(hallLetter);
            hallCounters.put(hallLetter, stallNumber + 1);
            
            // Format: A01-A09 for single digits, A10+ for double digits (no leading zeros for 10+)
            String name = (stallNumber < 10) 
                ? String.format("%c%02d", hallLetter, stallNumber)  // A01-A09
                : String.format("%c%d", hallLetter, stallNumber);   // A10, A72, B94, etc.
            
            String size = sizes[polygonIndex % 3]; // Rotate sizes
            
            Stall stall = new Stall();
            stall.setName(name);
            stall.setSize(size);
            stall.setReserved(false);
            stall.setX(x);
            stall.setY(y);
            
            stallRepository.save(stall);
        }
        
        System.out.println("Initialized " + POLYGON_X_COORDINATES.length + " stalls in polygon order with hall-based naming");
    }

    private void addMissingStalls() {
        long existingCount = stallRepository.count();
        int totalStalls = 436;
        int missingCount = totalStalls - (int)existingCount;
        
        if (missingCount <= 0) return;
        
        String[] sizes = {"SMALL", "MEDIUM", "LARGE"};
        
        // Group polygons by hall and add missing stalls
        Map<Character, List<Integer>> hallGroups = groupPolygonsByHall();
        int stallIndex = (int)existingCount;
        
        List<Map.Entry<Character, List<Integer>>> sortedHalls = new ArrayList<>(hallGroups.entrySet());
        sortedHalls.sort(Map.Entry.comparingByKey());
        
        for (Map.Entry<Character, List<Integer>> entry : sortedHalls) {
            char hallLetter = entry.getKey();
            List<Integer> polygonIndices = entry.getValue();
            
            for (Integer polygonIndex : polygonIndices) {
                if (stallIndex >= existingCount && stallIndex < totalStalls) {
                    int x = (polygonIndex < POLYGON_X_COORDINATES.length) 
                        ? POLYGON_X_COORDINATES[polygonIndex] 
                        : 100 + (polygonIndex * 50) % 2500;
                    int y = 100 + (polygonIndex * 60) % 2800;
                    
                    // Count existing stalls in this hall to determine next number
                    long existingInHall = stallRepository.findAll().stream()
                        .filter(s -> s.getName().startsWith(String.valueOf(hallLetter)))
                        .count();
                    int startNumber = getHallStartNumber(hallLetter);
                    int stallNumber = startNumber + (int)existingInHall;
                    
                    String size = sizes[stallIndex % 3];
                    // Format: A01-A09 for single digits, A10+ for double digits (no leading zeros for 10+)
                    String name = (stallNumber < 10) 
                        ? String.format("%c%02d", hallLetter, stallNumber)  // A01-A09
                        : String.format("%c%d", hallLetter, stallNumber);   // A10, A72, B94, etc.
                    
                    Stall stall = new Stall();
                    stall.setName(name);
                    stall.setSize(size);
                    stall.setReserved(false);
                    stall.setX(x);
                    stall.setY(y);
                    
                    stallRepository.save(stall);
                    stallIndex++;
                }
            }
        }
        
        System.out.println("Added " + missingCount + " missing stalls");
    }

    private Map<Character, List<Integer>> groupPolygonsByHall() {
        Map<Character, List<Integer>> hallGroups = new HashMap<>();
        
        // Group polygons by X and Y coordinate ranges
        for (int i = 0; i < POLYGON_X_COORDINATES.length; i++) {
            int x = POLYGON_X_COORDINATES[i];
            int y = (i < POLYGON_Y_COORDINATES.length) ? POLYGON_Y_COORDINATES[i] : (100 + (i * 60) % 2800);
            char hall = determineHallLetter(x, y);
            
            hallGroups.computeIfAbsent(hall, k -> new ArrayList<>()).add(i);
        }
        
        return hallGroups;
    }
    

    private char determineHallLetter(int x, int y) {
        // Determine hall letter based on X and Y coordinate ranges
        // Based on the actual map layout from the image
        
        // Very top area (Y >= 2000) - Halls M, L, N, P, Q
        if (y >= 2000) {
            if (x >= 2000 && x <= 2400) {
                return 'Q';  // Q415 - top right
            } else if (x >= 1800 && x < 2000) {
                return 'P';  // P414
            } else if (x >= 1600 && x < 1800) {
                return 'M';  // M412
            } else if (x >= 1400 && x < 1600) {
                return 'L';  // L413
            } else if (x >= 1200 && x < 1400) {
                return 'N';  // Hall N (Bargain Stalls) - N01 to N24
            } else if (x >= 2000) {
                return 'Q';  // Fallback for very high X
            }
        }
        
        // Top area (Y >= 2300) - Hall N specifically
        if (y >= 2300 && y <= 2800) {
            if (x >= 1200 && x < 1600) {
                return 'N';  // Hall N - N01 to N24 (Bargain Stalls)
            }
        }
        
        // Central area (Y ~500-2000) - Halls A and B (irregular shapes, main exhibition halls)
        if (y >= 500 && y < 2000) {
            // Hall B (right side of central area)
            if (x >= 1850 && x <= 2500) {
                return 'B';  // Hall B - B87 to B140
            }
            // Hall A (left/middle of central area)  
            if (x >= 1000 && x < 1850) {
                return 'A';  // Hall A - A01 to A82
            }
        }
        
        // Bottom right area (Y ~200-1000, X >= 1000)
        if (y >= 200 && y < 1000) {
            if (x >= 1400 && x < 1600) {
                return 'D';  // Hall D - D155 to D190
            } else if (x >= 1200 && x < 1400) {
                return 'C';  // Hall C - C141 to C154
            } else if (x >= 1000 && x < 1200) {
                return 'H';  // Hall H - H153 to H306
            }
        }
        
        // Bottom middle area (Y ~200-1000, X ~700-1100)
        if (y >= 200 && y < 1000) {
            if (x >= 700 && x < 1100) {
                return 'J';  // Hall J - J307 to J379
            }
        }
        
        // Bottom left area (Y ~200-1000, X < 700)
        if (y >= 200 && y < 1000) {
            if (x >= 400 && x < 700) {
                return 'K';  // Hall K - K380 to K411
            } else if (x >= 0 && x < 400) {
                return 'R';  // Hall R - R416
            }
        }
        
        // Very bottom area (Y < 500) - mostly Halls J, K, R
        if (y < 500) {
            if (x >= 700 && x < 1100) {
                return 'J';  // Hall J - J307 to J379
            } else if (x >= 400 && x < 700) {
                return 'K';  // Hall K - K380 to K411
            } else if (x >= 0 && x < 400) {
                return 'R';  // Hall R - R416
            }
        }
        
        // Default fallback based on X coordinate
        if (x >= 2000) return 'B';
        if (x >= 1000) return 'A';
        if (x >= 500) return 'H';
        if (x >= 200) return 'J';
        return 'K';
    }
    
    private int getHallStartNumber(char hallLetter) {
        // Return starting number for each hall based on image
        switch (hallLetter) {
            case 'A': return 1;   // A01 to A82
            case 'B': return 87;  // B87 to B140
            case 'C': return 141; // C141 to C154
            case 'D': return 155; // D155 to D190
            case 'H': return 153; // H153 to H306
            case 'J': return 307; // J307 to J379
            case 'K': return 380; // K380 to K411
            case 'L': return 413; // L413
            case 'M': return 412; // M412
            case 'N': return 1;   // N01 to N24
            case 'P': return 414; // P414
            case 'Q': return 415; // Q415
            case 'R': return 416; // R416
            default: return 1;
        }
    }
}
