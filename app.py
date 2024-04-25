import sys
import pandas
import pylab as pl
import numpy as np
from flask import Flask, render_template, jsonify
import numpy as np
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans

def load_compute_data():
    scaler = MinMaxScaler()

    data1 = pandas.read_csv('data1.csv', na_values='NaN').fillna(0)
    data1 = pandas.DataFrame(scaler.fit_transform(data1), columns=data1.columns)
    data = data1.values

    pca = PCA() # Number of components=10
    X_pca = pca.fit_transform(data)
    eigen_values = pca.explained_variance_
    eigen_values_cumsum = eigen_values.cumsum()
    loadings = pca.components_.T * np.sqrt(pca.explained_variance_)

    sqrd_loads = []
    feature = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    for i in range(1, 11): # for 10 attributes
        components = i
        sqrd_loads.append(np.sqrt(np.sum(np.square(loadings[:, :i]), axis=1)))
    sqrd_loads = np.array(sqrd_loads)


    data_cluster_labels = []
    mse = []
    tot_cluster_centers = []
    for i in range(1, 11): # k = 1 to 10
        n_clusters = i
        # K-means clustering model
        kmeans = KMeans(n_clusters=n_clusters, n_init=5)
        kmeans.fit(X_pca)

        # Cluster labels extraction
        cluster_labels = kmeans.labels_
        cluster_centers = kmeans.cluster_centers_
        square_dist = np.zeros(X_pca.shape[0])
        for i, center in enumerate(cluster_centers):
            square_dist[cluster_labels == i] = np.sum((X_pca[cluster_labels == i] - center) **2, axis = 1)

        print("data size : ", X_pca.shape[0], "mse : ", np.mean(square_dist))
        mse.append(np.mean(square_dist))
        tot_cluster_centers.append(cluster_centers.tolist())
        data_cluster_labels.append(cluster_labels.tolist())

        inertia = kmeans.inertia_

        # Add cluster labels 
        data1['C'+str(n_clusters)] = cluster_labels

    return [{
         'loadings' : loadings.tolist(),
         'data_cluster_labels' : data_cluster_labels,
         'raw_data' : data1.values.tolist(),
         'raw_data_columns' : data1.columns.tolist(),
         'data': data.tolist(),
         'pca_data': X_pca.tolist(),
         'eign_values' : eigen_values.tolist(),
         'eign_sum' : eigen_values_cumsum.tolist(),
         'mse' : mse,
         'tot_cluster_centers' : tot_cluster_centers,
         'sqrd_loads' : sqrd_loads.tolist()
    }]

app = Flask(__name__, template_folder = "./Templates")

@app.route('/')
def index():
    return render_template('Lab2.html')

@app.route('/data')
def load_data():
    obj = load_compute_data()
    return jsonify(obj)

if __name__ == '__main__':
    app.run(debug=True)
