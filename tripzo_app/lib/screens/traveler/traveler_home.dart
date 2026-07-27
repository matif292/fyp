import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'explore_screen.dart';
import 'my_trips_screen.dart';
import 'trip_planner_screen.dart';
import 'chat_screen.dart';
import 'profile_screen.dart';

class TravelerHome extends StatefulWidget {
  const TravelerHome({super.key});
  @override
  State<TravelerHome> createState() => _TravelerHomeState();
}

class _TravelerHomeState extends State<TravelerHome> {
  int _index = 0;

  final _screens = const [
    ExploreScreen(),
    MyTripsScreen(),
    TripPlannerScreen(),
    ChatScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(LucideIcons.compass), label: 'Explore'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.briefcase), label: 'My Trips'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.users), label: 'Planner'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.messageCircle), label: 'Chat'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.user), label: 'Profile'),
        ],
      ),
    );
  }
}
