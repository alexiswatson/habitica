"use strict";

habitrpg
  .controller("MemberModalCtrl", ['$scope', '$rootScope', 'Members', 'Shared', '$http', 'Notification', 'Groups', 'Chat', '$controller', 'Stats', 'Costume',
    function($scope, $rootScope, Members, Shared, $http, Notification, Groups, Chat, $controller, Stats, Costume) {

      $controller('RootCtrl', {$scope: $scope});
      $rootScope.appLoaded = true;

      $scope.timestamp = function(timestamp){
        return moment(timestamp).format($rootScope.User.user.preferences.dateFormat.toUpperCase());
      }

      $scope.statCalc = Stats;

      // We watch Members.selectedMember because it's asynchronously set, so would be a hassle to handle updates here
      $scope.$watch( function() { return Members.selectedMember; }, function (member) {
        if(member) {
          $scope.profile = member;

          $scope.achievements = Shared.achievements.getAchievementsForProfile($scope.profile);
          $scope.achievPopoverPlacement = 'left';
          $scope.achievAppendToBody = 'false'; // append-to-body breaks popovers in modal windows
        }
      });

      $scope.costume = Costume;

      $scope.keyDownListener = function (e) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          $scope.sendPrivateMessage($scope.profile._id, $scope._message);
        }
      };


      $scope.sendPrivateMessage = function(uuid, message){
        if (!message) return;

        Members.sendPrivateMessage(message, uuid)
          .then(function (response) {
            Notification.text(window.env.t('messageSentAlert'));
            $rootScope.User.sync();
            $scope.$close();
          });
      };

      //@TODO: We don't send subscriptions so the structure has changed in the back. Update this when we update the views.
      $scope.gift = {
        type: 'gems',
        gems: {amount: 0, fromBalance: true},
        subscription: {key: ''},
        message: ''
      };

      $scope.sendGift = function (uuid) {
        Members.transferGems($scope.gift.message, uuid, $scope.gift.gems.amount)
          .then(function (response) {
            Notification.text(window.env.t('sentGems'));
            $rootScope.User.sync();
            $scope.$close();
          });
      };

      $scope.reportAbuse = function(reporter, message, groupId) {
        Chat.flagChatMessage(groupId, message.id)
          .then(function(data){
            var res = data.data.data;
            message.flags = res.flags;
            message.flagCount = res.flagCount;
            Notification.text(window.env.t('abuseReported'));
            $scope.$close();
          });
      };

      $scope.clearFlagCount = function(message, groupId) {
        Chat.clearFlagCount(groupId, message.id)
          .then(function(data){
            message.flagCount = 0;
            Notification.text("Flags cleared");
            $scope.$close();
          });
      }
      $scope.aprilFool = function (pet) {
        if (!pet) return 'Pet-AprilFool-None';
        if (pet === 'Phoenix-Base') return 'Pet-AprilFool-Red';
        var petStringArray = pet.split('-');
        var petColor = petStringArray[1];
        var standardColors = ['Base', 'CottonCandyBlue', 'CottonCandyPink', 'Desert', 'Golden', 'Red', 'Shade', 'Skeleton', 'White', 'Zombie'];
        if (standardColors.indexOf(petColor) !== -1) return 'Pet-AprilFool-' + petColor;
        if (petColor === 'Cerberus') return 'Pet-AprilFool-Zombie';
        if (petColor === 'Cupid') return 'Pet-AprilFool-CottonCandyPink';
        if (petColor === 'Ghost') return 'Pet-AprilFool-Skeleton';
        if (petColor === 'Gilded') return 'Pet-AprilFool-Golden';
        if (petColor === 'Hydra') return 'Pet-AprilFool-Zombie';
        if (petColor === 'Polar') return 'Pet-AprilFool-White';
        if (petColor === 'RoyalPurple') return 'Pet-AprilFool-Golden';
        if (petColor === 'Shimmer') return 'Pet-AprilFool-Red';
        if (petColor === 'Spooky') return 'Pet-AprilFool-Zombie';
        if (petColor === 'Veteran') return 'Pet-AprilFool-Shade';
        return 'Pet-AprilFool-Magic';
      }
    }
  ]);
