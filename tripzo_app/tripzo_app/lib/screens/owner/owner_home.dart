import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dashboard_screen.dart';
import 'my_hostels_screen.dart';
import 'bookings_screen.dart';
import 'offers_screen.dart';
import 'owner_profile_screen.dart';

class OwnerHome extends StatefulWidget {
  const OwnerHome({super.key});
  @override
  State<OwnerHome> createState() => _OwnerHomeState();
}

class _OwnerHomeState extends State<OwnerHome> {
  int _index = 0;

  final _screens = const [
    OwnerDashboardScreen(),
    MyHostelsScreen(),
    OwnerBookingsScreen(),
    OffersScreen(),
    OwnerProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(LucideIcons.layoutDashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.building2), label: 'Hostels'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.calendarCheck), label: 'Bookings'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.handshake), label: 'Offers'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.user), label: 'Profile'),
        ],
      ),
    );
  }
}
