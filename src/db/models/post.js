'use strict';
module.exports = (sequelize, DataTypes) => {
  var Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {});
  Post.associate = function(models) {
    // associations can be defined here
    Post.belongsTo(models.Topic, {
      foreignKey: "topicId",
      onDelete: "CASCADE"
    });
    Post.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
    Post.hasMany(models.Comment, {
      foreignKey: "postId",
      as: "comments"
    });
    Post.hasMany(models.Vote, {
      foreignKey: "postId",
      as: "votes"
    });
  };
    Post.prototype.getPoints = function(){
    console.log("FROM GETPOINTS 1 : ", this.votes);
    if(this.votes && this.votes.length === 0) return 0
    console.log("FROM GETPOINTS 2 : ", this.votes);
    return this.votes
      .map((v) => {return v.value})
      .reduce((prev, next) => {return prev + next});
  };
  Post.prototype.hasUpvoteFor = function(userId){
    // console.log("FROM HASUPVOTEFOR: " + userId);
    if(!this.votes) return false;
    function checkVote(vote) {
      if(vote.userId === userId && vote.value === 1){
        return true;
      } else {
        return false;
      }
    }
    this.votes.find(checkVote);
  };
  return Post;
};