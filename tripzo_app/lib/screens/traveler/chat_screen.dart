import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../services/misc_services.dart';
import '../../widgets/state_widgets.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.gray500,
          indicatorColor: AppColors.primary,
          tabs: const [Tab(text: 'AI Assistant'), Tab(text: 'Conversations')],
        ),
      ),
      body: TabBarView(controller: _tabController, children: const [_AiChatTab(), _ConversationsTab()]),
    );
  }
}

class _ChatMessage {
  final String text;
  final bool fromUser;
  _ChatMessage(this.text, this.fromUser);
}

class _AiChatTab extends StatefulWidget {
  const _AiChatTab();
  @override
  State<_AiChatTab> createState() => _AiChatTabState();
}

class _AiChatTabState extends State<_AiChatTab> {
  final _chatbotService = ChatbotService();
  final _controller = TextEditingController();
  final _messages = <_ChatMessage>[
    _ChatMessage("Hi! I'm the Tripzo assistant — ask me about hostels, itineraries, or travel tips.", false),
  ];
  bool _sending = false;

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(_ChatMessage(text, true));
      _sending = true;
    });
    _controller.clear();
    try {
      final reply = await _chatbotService.sendMessage(text);
      setState(() => _messages.add(_ChatMessage(reply.isEmpty ? "..." : reply, false)));
    } catch (e) {
      setState(() => _messages.add(_ChatMessage(apiErrorMessage(e), false)));
    } finally {
      setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length,
            itemBuilder: (context, i) {
              final m = _messages[i];
              return Align(
                alignment: m.fromUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                  decoration: BoxDecoration(
                    color: m.fromUser ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(m.text, style: TextStyle(color: m.fromUser ? Colors.white : AppColors.gray800)),
                ),
              );
            },
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(hintText: 'Ask the assistant...'),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _sending ? null : _send,
                  icon: const Icon(LucideIcons.send),
                  style: IconButton.styleFrom(backgroundColor: AppColors.primary),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ConversationsTab extends StatefulWidget {
  const _ConversationsTab();
  @override
  State<_ConversationsTab> createState() => _ConversationsTabState();
}

class _ConversationsTabState extends State<_ConversationsTab> {
  final _chatService = ChatService();
  late Future<List<dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = _chatService.conversations();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => setState(() => _future = _chatService.conversations()),
      child: FutureBuilder<List<dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
          if (snapshot.hasError) {
            return ErrorState(
                message: apiErrorMessage(snapshot.error!),
                onRetry: () => setState(() => _future = _chatService.conversations()));
          }
          final conversations = snapshot.data ?? [];
          if (conversations.isEmpty) {
            return const EmptyState(
                icon: LucideIcons.messageCircle,
                title: 'No conversations yet',
                subtitle: 'Message a hostel owner from a hostel page to start chatting.');
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: conversations.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final c = conversations[i] as Map;
              return Card(
                child: ListTile(
                  leading: const CircleAvatar(backgroundColor: AppColors.gray100, child: Icon(LucideIcons.user)),
                  title: Text(c['owner_name']?.toString() ?? c['hostel_name']?.toString() ?? 'Owner'),
                  subtitle: Text(c['last_message']?.toString() ?? '', maxLines: 1, overflow: TextOverflow.ellipsis),
                  onTap: () {},
                ),
              );
            },
          );
        },
      ),
    );
  }
}
