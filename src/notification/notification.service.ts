import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { initializeFirebase, sendPushNotification } from '../config/firebase';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    initializeFirebase();
  }

  async sendNotificationToUsers(
    userIds: number[],
    title: string,
    message: string,
    type: NotificationType,
    relatedEntityId?: number,
    data?: any,
    isPublic: boolean = false,
  ): Promise<void> {
    try {
      const users = await this.userRepository.findBy({ id: In(userIds) });

      for (const user of users) {
        // Save notification to database
        const notification = this.notificationRepository.create({
          title,
          message,
          type,
          relatedEntityId,
          userId: user.id,
          isRead: false,
          sent: false,
          data,
          isPublic,
        });

        await this.notificationRepository.save(notification);

        // Send push notification if FCM token exists
        if (user.fcmToken) {
          try {
            await sendPushNotification(user.fcmToken, title, message);
            // Mark notification as sent
            notification.sent = true;
            await this.notificationRepository.save(notification);
            this.logger.log(
              `Push notification sent to user ${user.id}: ${title}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to send push notification to user ${user.id}:`,
              error,
            );
          }
        } else {
          this.logger.log(
            `No FCM token for user ${user.id}, notification saved to database only`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to send notifications:', error);
    }
  }

  async sendNotificationToAdmins(
    title: string,
    message: string,
    type: NotificationType,
    relatedEntityId?: number,
    data?: any,
  ): Promise<void> {
    const adminUsers = await this.userRepository.find({
      where: { isAdmin: true },
    });

    const adminIds = adminUsers.map((user) => user.id);
    await this.sendNotificationToUsers(
      adminIds,
      title,
      message,
      type,
      relatedEntityId,
      data,
    );
  }

  async sendNotificationToNonAdmins(
    title: string,
    message: string,
    type: NotificationType,
    relatedEntityId?: number,
    data?: any,
  ): Promise<void> {
    const nonAdminUsers = await this.userRepository.find({
      where: { isAdmin: false },
    });

    const nonAdminIds = nonAdminUsers.map((user) => user.id);
    await this.sendNotificationToUsers(
      nonAdminIds,
      title,
      message,
      type,
      relatedEntityId,
      data,
    );
  }

  async sendNotificationToUser(
    userId: number,
    title: string,
    message: string,
    type: NotificationType,
    relatedEntityId?: number,
    data?: any,
  ): Promise<void> {
    await this.sendNotificationToUsers(
      [userId],
      title,
      message,
      type,
      relatedEntityId,
      data,
      false, // User-specific notifications are not public
    );
  }

  async sendNotificationToAllUsers(
    title: string,
    message: string,
    type: NotificationType,
    relatedEntityId?: number,
    data?: any,
  ): Promise<void> {
    const allUsers = await this.userRepository.find();
    const allUserIds = allUsers.map((user) => user.id);
    await this.sendNotificationToUsers(
      allUserIds,
      title,
      message,
      type,
      relatedEntityId,
      data,
      true, // Public notifications for all users
    );
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    this.logger.log(`Getting notifications for user ID: ${userId}`);
    
    // First, let's get all notifications to debug
    const allNotifications = await this.notificationRepository.find({
      order: { createdAt: 'DESC' },
    });
    this.logger.log(`Total notifications in database: ${allNotifications.length}`);
    
    const notifications = await this.notificationRepository.find({
      where: [
        { userId }, // User-specific notifications
        { isPublic: true }, // Public notifications for all users
      ],
      order: { createdAt: 'DESC' },
    });
    
    this.logger.log(`Notifications found for user ${userId}: ${notifications.length}`);
    notifications.forEach(n => {
      this.logger.log(`Notification: ID=${n.id}, userId=${n.userId}, isPublic=${n.isPublic}, title=${n.title}`);
    });

    // For public notifications, check if user has read them
    return notifications.map(notification => {
      if (notification.isPublic) {
        const readByUsers = notification.readByUsers || [];
        return {
          ...notification,
          isRead: readByUsers.includes(userId),
        };
      }
      return notification;
    });
  }

  async markNotificationAsRead(notificationId: number, userId?: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({ where: { id: notificationId } });
    
    if (!notification) {
      return;
    }

    if (notification.isPublic && userId) {
      // For public notifications, add user to readByUsers array
      const readByUsers = notification.readByUsers || [];
      if (!readByUsers.includes(userId)) {
        readByUsers.push(userId);
        await this.notificationRepository.update(notificationId, { readByUsers });
      }
    } else if (!notification.isPublic) {
      // For user-specific notifications, mark as read
      await this.notificationRepository.update(notificationId, { isRead: true });
    }
  }

  async markAllUserNotificationsAsRead(userId: number): Promise<void> {
    this.logger.log(`Marking all notifications as read for user ID: ${userId}`);
    
    // Mark user-specific notifications as read
    const updateResult = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    this.logger.log(`Updated ${updateResult.affected} user-specific notifications`);

    // Mark public notifications as read by this user
    const publicNotifications = await this.notificationRepository.find({
      where: { isPublic: true },
    });
    this.logger.log(`Found ${publicNotifications.length} public notifications`);

    for (const notification of publicNotifications) {
      const readByUsers = notification.readByUsers || [];
      if (!readByUsers.includes(userId)) {
        readByUsers.push(userId);
        await this.notificationRepository.update(notification.id, { readByUsers });
        this.logger.log(`Marked public notification ${notification.id} as read by user ${userId}`);
      }
    }
  }

  // Service-related notifications
  async notifyServiceCreated(
    serviceId: number,
    serviceName: string,
  ): Promise<void> {
    await this.sendNotificationToAllUsers(
      'تم إضافة خدمة جديدة',
      `تم إضافة خدمة: "${serviceName}"`,
      NotificationType.SERVICE_CREATED,
      serviceId,
    );
  }

  // Request-related notifications
  async notifyRequestCreated(
    requestId: number,
    requestTitle: string,
  ): Promise<void> {
    await this.sendNotificationToAdmins(
      'تم إضافة طلب جديد',
      `تم إضافة طلب: "${requestTitle}"`,
      NotificationType.REQUEST_CREATED,
      requestId,
    );
  }

  async notifyRequestStatusUpdated(
    userId: number,
    requestId: number,
    requestTitle: string,
    newStatus: string,
    statusCode?: number,
    instructions?: string,
    link?: string,
  ): Promise<void> {
    let notificationData: any = undefined;
    
    // If status is 3 (COMPLETED/accepted), include instructions and link
    if (statusCode === 3 && (instructions || link)) {
      notificationData = {
        instructions,
        link,
      };
    }

    await this.sendNotificationToUser(
      userId,
      'تم تحديث حالة الطلب',
      `تم تحديث حالة الطلب "${requestTitle}" إلى: ${newStatus}`,
      NotificationType.REQUEST_STATUS_UPDATED,
      requestId,
      notificationData,
    );
  }

  // Complaint-related notifications
  async notifyComplaintCreated(
    complaintId: number,
    complaintTitle: string,
  ): Promise<void> {
    await this.sendNotificationToAdmins(
      'تم إضافة شكوى جديدة',
      `تم إضافة شكوى: "${complaintTitle}"`,
      NotificationType.COMPLAINT_CREATED,
      complaintId,
    );
  }

  async notifyComplaintStatusUpdated(
    userId: number,
    complaintId: number,
    complaintTitle: string,
    newStatus: string,
    statusCode?: number,
    instructions?: string,
    link?: string,
  ): Promise<void> {
    let notificationData: any = undefined;
    
    // If status is 3 (COMPLETED/accepted), include instructions and link
    if (statusCode === 3 && (instructions || link)) {
      notificationData = {
        instructions,
        link,
      };
    }

    await this.sendNotificationToUser(
      userId,
      'تم تحديث حالة الشكوى',
      `تم تحديث حالة الشكوى "${complaintTitle}" إلى: ${newStatus}`,
      NotificationType.COMPLAINT_STATUS_UPDATED,
      complaintId,
      notificationData,
    );
  }

  // Post-related notifications
  async notifyPostCreated(postId: number, postTitle: string): Promise<void> {
    await this.sendNotificationToAllUsers(
      'تم إضافة منشور جديد',
      `تم إضافة منشور جديد: "${postTitle}"`,
      NotificationType.POST_CREATED,
      postId,
    );
  }
}
