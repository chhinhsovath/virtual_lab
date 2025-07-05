'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageSquare,
  Send,
  Inbox,
  Users,
  User,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Paperclip,
  Search,
  Filter,
  Archive,
  Trash,
  Star,
  Reply,
  Forward,
  MoreVertical,
  Mail,
  Phone,
  ArrowLeft,
  Bell
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Message {
  id: string;
  subject: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar?: string;
  recipients: Array<{
    id: string;
    name: string;
    type: 'student' | 'parent' | 'class';
  }>;
  timestamp: string;
  read: boolean;
  starred: boolean;
  has_attachment: boolean;
  thread_id?: string;
  reply_to?: string;
  category: 'general' | 'academic' | 'behavioral' | 'announcement';
  priority: 'low' | 'normal' | 'high';
}

interface Student {
  id: string;
  name: string;
  class: string;
  email?: string;
  parent_email?: string;
  parent_phone?: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

export default function TeacherMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    recipients: [] as string[],
    recipientType: 'individual',
    subject: '',
    content: '',
    category: 'general',
    priority: 'normal',
    selectedTemplate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockMessages: Message[] = [
          {
            id: '1',
            subject: 'Sokha\'s Progress Update',
            content: 'I wanted to update you on Sokha\'s excellent progress in the Physics simulations...',
            sender_id: 'teacher1',
            sender_name: 'You',
            sender_role: 'teacher',
            recipients: [{ id: 'parent1', name: 'Sokha\'s Parent', type: 'parent' }],
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: true,
            starred: true,
            has_attachment: false,
            category: 'academic',
            priority: 'normal'
          },
          {
            id: '2',
            subject: 'Class 10A Assignment Reminder',
            content: 'Dear students, this is a reminder that the Physics Pendulum Lab assignment is due tomorrow...',
            sender_id: 'teacher1',
            sender_name: 'You',
            sender_role: 'teacher',
            recipients: [{ id: 'class1', name: 'Class 10A', type: 'class' }],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            read: true,
            starred: false,
            has_attachment: true,
            category: 'announcement',
            priority: 'high'
          },
          {
            id: '3',
            subject: 'Question about homework',
            content: 'Dear Teacher, I have a question about the chemical reactions assignment...',
            sender_id: 'student1',
            sender_name: 'Dara Kim',
            sender_role: 'student',
            recipients: [{ id: 'teacher1', name: 'You', type: 'student' }],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            read: false,
            starred: false,
            has_attachment: false,
            category: 'academic',
            priority: 'normal'
          }
        ];

        const mockStudents: Student[] = [
          {
            id: 'student1',
            name: 'Sokha Chan',
            class: 'Class 10A',
            email: 'sokha@school.edu',
            parent_email: 'parent.sokha@email.com',
            parent_phone: '+855 12 345 678'
          },
          {
            id: 'student2',
            name: 'Dara Kim',
            class: 'Class 10B',
            email: 'dara@school.edu',
            parent_email: 'parent.dara@email.com'
          }
        ];

        const mockTemplates: MessageTemplate[] = [
          {
            id: '1',
            name: 'Progress Update',
            subject: 'Progress Update - [Student Name]',
            content: 'Dear Parent,\n\nI wanted to update you on [Student Name]\'s progress in class...',
            category: 'academic'
          },
          {
            id: '2',
            name: 'Assignment Reminder',
            subject: 'Assignment Reminder - [Assignment Name]',
            content: 'Dear Students,\n\nThis is a reminder that [Assignment Name] is due on [Due Date]...',
            category: 'announcement'
          },
          {
            id: '3',
            name: 'Parent Meeting Invitation',
            subject: 'Parent-Teacher Meeting Invitation',
            content: 'Dear Parent,\n\nI would like to invite you to discuss [Student Name]\'s progress...',
            category: 'general'
          }
        ];

        setMessages(mockMessages);
        setStudents(mockStudents);
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMessages = messages.filter(message => {
    if (selectedTab === 'sent' && message.sender_id !== 'teacher1') return false;
    if (selectedTab === 'starred' && !message.starred) return false;
    
    if (searchTerm && !message.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !message.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (filterCategory !== 'all' && message.category !== filterCategory) return false;
    
    return true;
  });

  const sendMessage = async () => {
    try {
      // API call would go here
      toast.success('Message sent successfully!');
      setShowComposeDialog(false);
      // Reset form
      setComposeForm({
        recipients: [],
        recipientType: 'individual',
        subject: '',
        content: '',
        category: 'general',
        priority: 'normal',
        selectedTemplate: ''
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const toggleStar = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
    ));
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setComposeForm({
        ...composeForm,
        subject: template.subject,
        content: template.content,
        category: template.category as any,
        selectedTemplate: templateId
      });
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      academic: 'bg-blue-100 text-blue-800',
      behavioral: 'bg-yellow-100 text-yellow-800',
      announcement: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages & Communication</h1>
                <p className="text-gray-600 mt-1">
                  Communicate with students and parents
                </p>
              </div>
            </div>
            <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
              <DialogTrigger asChild>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Compose Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Compose New Message</DialogTitle>
                  <DialogDescription>
                    Send a message to students or parents
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Template Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Use Template (Optional)</label>
                    <Select
                      value={composeForm.selectedTemplate}
                      onValueChange={loadTemplate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No template</SelectItem>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recipient Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Send To</label>
                    <Select
                      value={composeForm.recipientType}
                      onValueChange={(value) => setComposeForm({ ...composeForm, recipientType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual Students/Parents</SelectItem>
                        <SelectItem value="class">Entire Class</SelectItem>
                        <SelectItem value="all_parents">All Parents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recipients */}
                  {composeForm.recipientType === 'individual' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Recipients</label>
                      <div className="border rounded-lg p-4 max-h-40 overflow-y-auto space-y-2">
                        {students.map(student => (
                          <div key={student.id} className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`student-${student.id}`}
                                checked={composeForm.recipients.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setComposeForm({
                                      ...composeForm,
                                      recipients: [...composeForm.recipients, student.id]
                                    });
                                  } else {
                                    setComposeForm({
                                      ...composeForm,
                                      recipients: composeForm.recipients.filter(id => id !== student.id)
                                    });
                                  }
                                }}
                              />
                              <label htmlFor={`student-${student.id}`} className="text-sm">
                                {student.name} ({student.class})
                              </label>
                            </div>
                            {student.parent_email && (
                              <div className="flex items-center space-x-2 ml-6">
                                <Checkbox
                                  id={`parent-${student.id}`}
                                  checked={composeForm.recipients.includes(`parent-${student.id}`)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setComposeForm({
                                        ...composeForm,
                                        recipients: [...composeForm.recipients, `parent-${student.id}`]
                                      });
                                    } else {
                                      setComposeForm({
                                        ...composeForm,
                                        recipients: composeForm.recipients.filter(id => id !== `parent-${student.id}`)
                                      });
                                    }
                                  }}
                                />
                                <label htmlFor={`parent-${student.id}`} className="text-sm text-gray-600">
                                  Parent ({student.parent_email})
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      placeholder="Message subject"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                    />
                  </div>

                  {/* Category and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={composeForm.category}
                        onValueChange={(value) => setComposeForm({ ...composeForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        value={composeForm.priority}
                        onValueChange={(value) => setComposeForm({ ...composeForm, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={composeForm.content}
                      onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                      rows={8}
                    />
                  </div>

                  {/* Attachments */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Paperclip className="h-4 w-4" />
                    <span>Attach files (optional)</span>
                    <Button variant="outline" size="sm">Browse</Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Navigation */}
                <div className="space-y-1">
                  <Button
                    variant={selectedTab === 'inbox' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedTab('inbox')}
                  >
                    <Inbox className="h-4 w-4 mr-2" />
                    Inbox
                    <Badge variant="secondary" className="ml-auto">
                      {messages.filter(m => !m.read).length}
                    </Badge>
                  </Button>
                  
                  <Button
                    variant={selectedTab === 'sent' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedTab('sent')}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Sent
                  </Button>
                  
                  <Button
                    variant={selectedTab === 'starred' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedTab('starred')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Starred
                  </Button>
                </div>

                {/* Category Filter */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">Categories</h3>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Messages</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Unread</span>
                    <span className="font-medium text-blue-600">
                      {messages.filter(m => !m.read).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-medium">
                      {messages.filter(m => 
                        new Date(m.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  {filteredMessages.length} messages in {selectedTab}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                        !message.read ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        markAsRead(message.id);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Avatar>
                            <AvatarImage src={message.sender_avatar} />
                            <AvatarFallback>
                              {message.sender_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{message.sender_name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {message.sender_role}
                              </Badge>
                              <Badge className={`text-xs ${getCategoryBadge(message.category)}`}>
                                {message.category}
                              </Badge>
                              {getPriorityIcon(message.priority)}
                            </div>
                            
                            <h3 className="font-medium text-gray-900 mb-1">
                              {message.subject}
                            </h3>
                            
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {message.content}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(message.timestamp).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                              {message.has_attachment && (
                                <span className="flex items-center">
                                  <Paperclip className="h-3 w-3 mr-1" />
                                  Attachment
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(message.id);
                            }}
                          >
                            <Star className={`h-4 w-4 ${message.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Forward className="h-4 w-4 mr-2" />
                                Forward
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredMessages.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                      <p className="text-gray-500">
                        {searchTerm || filterCategory !== 'all' 
                          ? 'Try adjusting your filters'
                          : 'Start a conversation by composing a new message'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}